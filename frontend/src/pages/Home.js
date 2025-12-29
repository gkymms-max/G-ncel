import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalQuotes: 0,
    monthlyQuotes: 0,
    recentQuotes: [],
    quoteTrend: [],
    categoryDistribution: [],
    topProducts: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [products, customers, quotes] = await Promise.all([
        axios.get(`${API}/products`, { headers }),
        axios.get(`${API}/customers`, { headers }),
        axios.get(`${API}/quotes`, { headers })
      ]);

      // Calculate monthly quotes (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyQuotes = quotes.data.filter(q => 
        new Date(q.quote_date) > thirtyDaysAgo
      ).length;

      // Recent quotes (last 5)
      const recentQuotes = quotes.data
        .sort((a, b) => new Date(b.quote_date) - new Date(a.quote_date))
        .slice(0, 5);

      // Quote trend (last 6 months)
      const quoteTrend = calculateMonthlyTrend(quotes.data);

      // Category distribution
      const categoryDist = calculateCategoryDistribution(products.data);

      // Top products (by usage in quotes)
      const topProducts = calculateTopProducts(quotes.data, products.data);

      setStats({
        totalProducts: products.data.length,
        totalCustomers: customers.data.length,
        totalQuotes: quotes.data.length,
        monthlyQuotes,
        recentQuotes,
        quoteTrend,
        categoryDistribution: categoryDist,
        topProducts
      });

      setLoading(false);
    } catch (error) {
      console.error("Dashboard verisi yüklenemedi:", error);
      setLoading(false);
    }
  };

  const calculateMonthlyTrend = (quotes) => {
    const months = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      months[monthKey] = 0;
    }

    quotes.forEach(quote => {
      const quoteDate = new Date(quote.quote_date);
      const monthKey = quoteDate.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      if (months.hasOwnProperty(monthKey)) {
        months[monthKey]++;
      }
    });

    return Object.entries(months).map(([month, count]) => ({
      month,
      count
    }));
  };

  const calculateCategoryDistribution = (products) => {
    const categories = {};
    products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const calculateTopProducts = (quotes, products) => {
    const productUsage = {};
    
    quotes.forEach(quote => {
      quote.items.forEach(item => {
        productUsage[item.product_id] = (productUsage[item.product_id] || 0) + 1;
      });
    });

    return Object.entries(productUsage)
      .map(([productId, count]) => {
        const product = products.find(p => p.id === productId);
        return {
          name: product ? product.name.substring(0, 30) : 'Bilinmeyen',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
              {trend && (
                <div className="flex items-center mt-2">
                  {trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trendValue}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">bu ay</span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-full bg-opacity-10`} style={{ backgroundColor: color }}>
              <Icon className="h-8 w-8" style={{ color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Hoş Geldiniz 👋
        </h1>
        <p className="text-gray-600">İşte işletmenizin özeti</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={Package}
          color="#4F46E5"
          delay={0.1}
        />
        <StatCard
          title="Toplam Müşteri"
          value={stats.totalCustomers}
          icon={Users}
          color="#10B981"
          delay={0.2}
        />
        <StatCard
          title="Toplam Teklif"
          value={stats.totalQuotes}
          icon={FileText}
          color="#F59E0B"
          delay={0.3}
        />
        <StatCard
          title="Bu Ayki Teklifler"
          value={stats.monthlyQuotes}
          icon={TrendingUp}
          trend="up"
          trendValue={`${stats.monthlyQuotes}`}
          color="#8B5CF6"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan işlemlere hızlı erişim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 text-base"
                onClick={() => navigate('/quotes')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Yeni Teklif Oluştur
              </Button>
              <Button 
                className="h-20 text-base"
                variant="outline"
                onClick={() => navigate('/customers')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Yeni Müşteri Ekle
              </Button>
              <Button 
                className="h-20 text-base"
                variant="outline"
                onClick={() => navigate('/products')}
              >
                <Package className="mr-2 h-5 w-5" />
                Ürünleri Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Teklif Eğilimi</CardTitle>
              <CardDescription>Son 6 aylık teklif sayıları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.quoteTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Kategori Dağılımı</CardTitle>
              <CardDescription>Ürün kategorilerine göre dağılım</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>En Çok Kullanılan Ürünler</CardTitle>
              <CardDescription>Tekliflerde en sık kullanılan ürünler</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Son Teklifler</CardTitle>
              <CardDescription>En son oluşturulan teklifler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentQuotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>Henüz teklif yok</p>
                  </div>
                ) : (
                  stats.recentQuotes.map((quote, index) => (
                    <motion.div
                      key={quote.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + (index * 0.1) }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/quotes')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">{quote.quote_number}</p>
                          <p className="text-sm text-gray-500">{quote.customer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-600">{quote.total.toFixed(2)} {quote.currency}</p>
                        <p className="text-xs text-gray-500">{new Date(quote.quote_date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              {stats.recentQuotes.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-4"
                  onClick={() => navigate('/quotes')}
                >
                  Tüm Teklifleri Görüntüle
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
