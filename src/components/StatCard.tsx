import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

export const StatCard = ({ icon, title, value }: StatCardProps) => {
  return (
    <Card className="p-4 flex flex-col items-center gap-2 bg-background/50 hover:bg-background/80 transition-colors border-2 border-accent-cyan/30">
      <div className="text-accent-cyan">{icon}</div>
      <div className="text-sm font-medium text-center w-full">{value}</div>
      <div className="text-xs text-muted-foreground text-center w-full">
        {title}
      </div>
    </Card>
  );
};
