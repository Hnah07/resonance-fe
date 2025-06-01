import { Card, CardContent } from "./ui/card";
import { LuPlus } from "react-icons/lu";

const AddConcertCard = () => {
  return (
    <Card className="mb-4 border-2 border-dashed border-accent-cyan/50 bg-accent-cyan/10 hover:bg-accent-cyan/50 transition-colors cursor-pointer">
      <CardContent className="flex items-center justify-center gap-2 py-6">
        <LuPlus className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Can&apos;t find your concert? Add it yourself
        </span>
      </CardContent>
    </Card>
  );
};

export default AddConcertCard;
