import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { HistoricalDataPoint } from '@/types/dashboard';

interface ScoreTrendChartProps {
  dataPoints: HistoricalDataPoint[];
}

export const ScoreTrendChart = ({ dataPoints }: ScoreTrendChartProps) => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataPoints}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          {/* Reference lines for payout thresholds */}
          <ReferenceLine y={80} stroke="hsl(142 76% 36%)" strokeDasharray="5 5" label={{ value: '100% payout', position: 'right', fontSize: 10 }} />
          <ReferenceLine y={70} stroke="hsl(38 92% 50%)" strokeDasharray="5 5" label={{ value: '75%', position: 'right', fontSize: 10 }} />
          <ReferenceLine y={60} stroke="hsl(38 92% 50%)" strokeDasharray="5 5" label={{ value: '50%', position: 'right', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              return [value.toFixed(1), 'Monthly Score'];
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={() => 'Final Monthly Score'}
          />
          <Line
            type="monotone"
            dataKey="propertyScore"
            name="propertyScore"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
