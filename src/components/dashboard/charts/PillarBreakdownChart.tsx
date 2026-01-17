import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoricalDataPoint } from '@/types/dashboard';

interface PillarBreakdownChartProps {
  dataPoints: HistoricalDataPoint[];
}

export const PillarBreakdownChart = ({ dataPoints }: PillarBreakdownChartProps) => {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={dataPoints}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10 }}
            className="text-muted-foreground"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            className="text-muted-foreground"
            width={30}
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
                operationsScore: 'Operations',
                financialScore: 'Financial',
                customerScore: 'Customer',
                ecosystemScore: 'Ecosystem',
              };
              return [value.toFixed(1), labels[name] || name];
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                operationsScore: 'Ops',
                financialScore: 'Fin',
                customerScore: 'CX',
                ecosystemScore: 'Eco',
              };
              return labels[value] || value;
            }}
          />
          <Area
            type="monotone"
            dataKey="operationsScore"
            stackId="1"
            stroke="hsl(221 83% 53%)"
            fill="hsl(221 83% 53% / 0.6)"
          />
          <Area
            type="monotone"
            dataKey="financialScore"
            stackId="1"
            stroke="hsl(142 76% 36%)"
            fill="hsl(142 76% 36% / 0.6)"
          />
          <Area
            type="monotone"
            dataKey="customerScore"
            stackId="1"
            stroke="hsl(38 92% 50%)"
            fill="hsl(38 92% 50% / 0.6)"
          />
          <Area
            type="monotone"
            dataKey="ecosystemScore"
            stackId="1"
            stroke="hsl(280 65% 60%)"
            fill="hsl(280 65% 60% / 0.6)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
