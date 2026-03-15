
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ShieldCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DriverCardProps {
  name: string;
  avatar: string;
  rating: number;
  trips: number;
}

export function DriverCard({ name, avatar, rating, trips }: DriverCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-primary">{name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5 text-yellow-600 font-medium">
                <Star className="w-3 h-3 fill-current" /> {rating}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>
        </div>
        <Button size="icon" variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5">
          <Phone className="w-4 h-4 text-primary" />
        </Button>
      </CardContent>
    </Card>
  );
}
