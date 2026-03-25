
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DriverCardProps {
  name: string;
  avatar?: string;
  rating: number;
  trips: number;
  verificationStatus?: string;
}

export function DriverCard({ name, avatar, rating, trips, verificationStatus = 'approved' }: DriverCardProps) {
  return (
    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 border border-slate-100">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-accent/10 text-accent font-bold">{name[0]}</AvatarFallback>
            </Avatar>
            {verificationStatus === 'approved' && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-primary">{name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {rating.toFixed(1)}
              </span>
              <span className="text-slate-200">•</span>
              <span className="text-slate-500">{trips.toLocaleString()} missions</span>
            </div>
          </div>
        </div>
        <Badge className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {verificationStatus === 'approved' ? '✓ Vérifié' : 'Pending'}
        </Badge>
      </CardContent>
    </Card>
  );
}
