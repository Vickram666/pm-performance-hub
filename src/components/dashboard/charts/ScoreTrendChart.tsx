import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
            domain={[0, 200]}
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                totalScore: 'Total Score',
                propertyScore: 'Property Score',
                revenueScore: 'Revenue Score',
              };
              return [value.toFixed(1), labels[name] || name];
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                totalScore: 'Total Score',
                propertyScore: 'Property Score',
                revenueScore: 'Revenue Score',
              };
              return labels[value] || value;
            }}
          />
          <Line
            type="monotone"
            dataKey="totalScore"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="propertyScore"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(142 76% 36%)', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="revenueScore"
            stroke="hsl(217 91% 60%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(217 91% 60%)', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
