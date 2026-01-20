import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HistoricalDataPoint, PayoutBand } from '@/types/dashboard';

interface IncentiveHistoryChartProps {
  dataPoints: HistoricalDataPoint[];
}

// Map payout bands to numeric values for chart
const payoutBandToValue: Record<PayoutBand, number> = {
  '100%': 100,
  '75%': 75,
  '50%': 50,
  'nil': 0,
};

export const IncentiveHistoryChart = ({ dataPoints }: IncentiveHistoryChartProps) => {
  const chartData = dataPoints.map(d => ({
    ...d,
    payoutValue: payoutBandToValue[d.payoutBand],
  }));

  const getBarColor = (payoutBand: PayoutBand) => {
    switch (payoutBand) {
      case '100%':
        return 'hsl(142 76% 36%)';
      case '75%':
        return 'hsl(38 92% 50%)';
      case '50%':
        return 'hsl(38 70% 50%)';
      case 'nil':
        return 'hsl(0 84% 60%)';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
            domain={[0, 100]}
            ticks={[0, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10 }}
            className="text-muted-foreground"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string, props: any) => [
              props.payload.payoutBand === 'nil' ? 'No Incentive' : `${props.payload.payoutBand} Payout`,
              'Eligibility',
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar dataKey="payoutValue" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.payoutBand)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-muted-foreground">100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-muted-foreground">75%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-600" />
          <span className="text-muted-foreground">50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-muted-foreground">Nil</span>
        </div>
      </div>
    </div>
  );
};
