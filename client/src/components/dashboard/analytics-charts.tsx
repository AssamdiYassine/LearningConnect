import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bar } from '@nivo/bar';
import { Pie } from '@nivo/pie';
import { Line } from '@nivo/line';

interface RevenueData {
  month: string;
  amount: number;
}

interface UsersData {
  month: string;
  user_count: number;
  trainer_count: number;
}

interface DistributionData {
  label: string;
  value: number;
}

interface AnalyticsChartsProps {
  revenueData?: RevenueData[];
  usersData?: UsersData[];
  distributionData?: DistributionData[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  revenueData = [],
  usersData = [],
  distributionData = [],
}) => {
  // Formater les données pour les graphiques
  const monthlyData = revenueData.map(item => ({
    month: item.month,
    revenue: item.amount
  }));

  const pieData = distributionData.map(item => ({
    id: item.label,
    value: item.value,
    label: item.label,
    color: item.label === 'Formateurs' ? '#7A6CFF' : '#5F8BFF'
  }));

  const lineData = [
    {
      id: "utilisateurs",
      color: "#5F8BFF",
      data: usersData.map(item => ({
        x: item.month,
        y: item.user_count
      }))
    },
    {
      id: "formateurs",
      color: "#7A6CFF",
      data: usersData.map(item => ({
        x: item.month,
        y: item.trainer_count
      }))
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenus mensuels</CardTitle>
          <CardDescription>Évolution des revenus sur les 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar
              data={monthlyData}
              keys={["revenue"]}
              indexBy="month"
              width={500}
              height={300}
              margin={{ top: 10, right: 10, bottom: 40, left: 60 }}
              padding={0.3}
              colors={["#5F8BFF"]}
              borderRadius={4}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickValues: 5,
                format: (value) => `${value}€`,
              }}
              gridYValues={5}
              enableLabel={false}
              tooltip={({ data, value }) => (
                <div className="bg-white p-2 text-xs shadow rounded">
                  <strong>{data.month}:</strong> {value}€
                </div>
              )}
              theme={{
                tooltip: {
                  container: {
                    background: "white",
                    fontSize: 12,
                    borderRadius: 4,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Répartition des revenus</CardTitle>
          <CardDescription>Répartition entre la plateforme et les formateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Pie
              data={pieData}
              width={400}
              height={300}
              margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ datum: 'data.color' }}
              borderWidth={1}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]]
              }}
              enableArcLinkLabels={true}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: 'color',
                modifiers: [['darker', 2]]
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Croissance des utilisateurs</CardTitle>
          <CardDescription>Tendance des inscriptions sur 6 mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line
              data={lineData}
              width={500}
              height={300}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickValues: 5,
              }}
              enablePoints={true}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableGridX={false}
              enableArea={true}
              areaOpacity={0.1}
              useMesh={true}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 40,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                }
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;