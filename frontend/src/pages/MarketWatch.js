import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Euro, CircleDollarSign, Gem } from "lucide-react";

const markets = [
  {
    id: "usd",
    name: "Dolar (USD/TRY)",
    icon: DollarSign,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22FX%3AUSDTRY%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22underLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D"
  },
  {
    id: "eur",
    name: "Euro (EUR/TRY)",
    icon: Euro,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22FX%3AEURTRY%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22underLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D"
  },
  {
    id: "gold",
    name: "Altın (XAU/USD)",
    icon: CircleDollarSign,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22TVC%3AGOLD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(255%2C%20235%2C%2059%2C%201)%22%2C%22underLineColor%22%3A%22rgba(255%2C%20235%2C%2059%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(255%2C%20235%2C%2059%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D"
  },
  {
    id: "silver",
    name: "Gümüş (XAG/USD)",
    icon: Gem,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22TVC%3ASILVER%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(192%2C%20192%2C%20192%2C%201)%22%2C%22underLineColor%22%3A%22rgba(192%2C%20192%2C%20192%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(192%2C%20192%2C%20192%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D"
  },
  {
    id: "aluminum",
    name: "Alüminyum (LME)",
    icon: TrendingUp,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22LME%3AAH1!%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(150%2C%20150%2C%20150%2C%201)%22%2C%22underLineColor%22%3A%22rgba(150%2C%20150%2C%20150%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(150%2C%20150%2C%20150%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D"
  }
];

export default function MarketWatch() {
  const [activeTab, setActiveTab] = useState("usd");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Canlı Borsa Takibi
        </h1>
        <p className="text-gray-600">Döviz kurları ve emtia fiyatlarını canlı takip edin</p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {markets.map(market => (
          <Card key={market.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab(market.id)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3">
                  <market.icon className="h-4 w-4 text-gray-600" />
                  <div className="text-xs font-medium text-gray-700">{market.name.split(' ')[0]}</div>
                </div>
                <div className="relative w-full h-[60px]">
                  {market.widget ? (
                    <iframe
                      src={market.widget}
                      className="w-full h-full border-0"
                      title={`${market.name} mini`}
                      frameBorder="0"
                      allowTransparency="true"
                      scrolling="no"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">
                      Canlı
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {markets.map(market => (
            <TabsTrigger key={market.id} value={market.id} className="flex items-center gap-2">
              <market.icon className="h-4 w-4" />
              {market.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {markets.map(market => (
          <TabsContent key={market.id} value={market.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <market.icon className="h-5 w-5" />
                  {market.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[500px]">
                  <iframe
                    src={market.widget}
                    className="w-full h-full border-0"
                    title={market.name}
                    frameBorder="0"
                    allowTransparency="true"
                    scrolling="no"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Fiyatlar TradingView ve Investing.com'dan canlı olarak çekilmektedir. 
          Gerçek zamanlı veriler için sayfayı yenileyin.
        </p>
      </div>
    </div>
  );
}
