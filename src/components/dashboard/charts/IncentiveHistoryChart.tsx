import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HistoricalDataPoint } from '@/types/dashboard';

interface IncentiveHistoryChartProps {
  dataPoints: HistoricalDataPoint[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value}`;
};

export const IncentiveHistoryChart = ({ dataPoints }: IncentiveHistoryChartProps) => {
  const getBarColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'hsl(142 76% 36%)';
      case 'partial':
        return 'hsl(38 92% 50%)';
      case 'blocked':
        return 'hsl(0 84% 60%)';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataPoints}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10 }}
            className="text-muted-foreground"
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10 }}
            className="text-muted-foreground"
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(value),
              'Incentive',
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar dataKey="incentiveAmount" radius={[4, 4, 0, 0]}>
            {dataPoints.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.eligibilityStatus)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-muted-foreground">Eligible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-muted-foreground">Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-muted-foreground">Blocked</span>
        </div>
      </div>
    </div>
  );
};
