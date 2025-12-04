import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Euro, CircleDollarSign, Gem } from "lucide-react";

const markets = [
  {
    id: "usd",
    name: "Dolar",
    symbol: "USD/TRY",
    icon: DollarSign,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22FX%3AUSDTRY%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22underLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D",
    tvSymbol: "FX:USDTRY"
  },
  {
    id: "eur",
    name: "Euro",
    symbol: "EUR/TRY",
    icon: Euro,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22FX%3AEURTRY%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22underLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D",
    tvSymbol: "FX:EURTRY"
  },
  {
    id: "gold",
    name: "Altın",
    symbol: "XAU/USD",
    icon: CircleDollarSign,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22TVC%3AGOLD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(255%2C%20235%2C%2059%2C%201)%22%2C%22underLineColor%22%3A%22rgba(255%2C%20235%2C%2059%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(255%2C%20235%2C%2059%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D",
    tvSymbol: "TVC:GOLD"
  },
  {
    id: "silver",
    name: "Gümüş",
    symbol: "XAG/USD",
    icon: Gem,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22TVC%3ASILVER%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(192%2C%20192%2C%20192%2C%201)%22%2C%22underLineColor%22%3A%22rgba(192%2C%20192%2C%20192%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(192%2C%20192%2C%20192%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D",
    tvSymbol: "TVC:SILVER"
  },
  {
    id: "aluminum",
    name: "Alüminyum",
    symbol: "LME",
    icon: TrendingUp,
    widget: "https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=tr#%7B%22symbol%22%3A%22PEPPERSTONE%3AXAL%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22rgba(150%2C%20150%2C%20150%2C%201)%22%2C%22underLineColor%22%3A%22rgba(150%2C%20150%2C%20150%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(150%2C%20150%2C%20150%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22chartOnly%22%3Afalse%2C%22noTimeScale%22%3Afalse%7D",
    tvSymbol: "PEPPERSTONE:XAL"
  }
];

export default function MarketWatch() {
  const [activeTab, setActiveTab] = useState("usd");

  return (
    <div className="p-8">
      <div className="mb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Canlı Borsa Takibi
        </h1>
        <p className="text-gray-600 mb-4">Döviz kurları ve emtia fiyatlarını canlı takip edin</p>
        
        {/* Compact Live Price Bar - Right under the title */}
        <div className="flex gap-3 py-3 px-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100 overflow-x-auto">
          {markets.map(market => (
            <div 
              key={market.id} 
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-fit"
              onClick={() => setActiveTab(market.id)}
            >
              <market.icon className="h-4 w-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-700">{market.name}</span>
                <span className="text-xs text-gray-500">{market.symbol}</span>
              </div>
              <div className="h-8 w-16 ml-2">
                <iframe
                  src={`https://s.tradingview.com/embed-widget/single-quote/?locale=tr#%7B%22symbol%22%3A%22${market.tvSymbol}%22%2C%22width%22%3A%2270%22%2C%22height%22%3A%2235%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Atrue%7D`}
                  className="w-full h-full border-0"
                  title={`${market.name} live`}
                  frameBorder="0"
                  scrolling="no"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-5">
          {markets.map(market => (
            <TabsTrigger key={market.id} value={market.id} className="flex items-center gap-2">
              <market.icon className="h-4 w-4" />
              {market.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {markets.map(market => (
          <TabsContent key={market.id} value={market.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <market.icon className="h-5 w-5" />
                  {market.name} ({market.symbol})
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
          <strong>Not:</strong> Fiyatlar TradingView'dan canlı olarak çekilmektedir. 
          Gerçek zamanlı veriler için sayfayı yenileyin.
        </p>
        <p className="text-sm text-blue-600 mt-2">
          <strong>Bakır widget gösterilemiyor:</strong> TradingView'in widget sınırlamaları nedeniyle, 
          detaylı Bakır fiyatlarını görmek için{" "}
          <a 
            href="https://www.tradingview.com/symbols/COMEX-HG1!/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            buraya tıklayın
          </a>.
        </p>
      </div>
    </div>
  );
}
