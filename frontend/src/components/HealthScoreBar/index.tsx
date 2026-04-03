import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

interface Props {
  score: number;
  showLabel?: boolean;
  size?: 'small' | 'default';
}

export function HealthScoreBar({ score, showLabel = true, size = 'default' }: Props) {
  const color =
    score >= 70 ? '#16a34a' :
    score >= 40 ? '#d97706' :
    '#dc2626';

  const label = score >= 70 ? 'Healthy' : score >= 40 ? 'Fair' : 'Critical';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex items-center gap-2', size === 'small' ? 'w-24' : 'w-32')}>
          <Progress
            value={score}
            indicatorColor={color}
            className={size === 'small' ? 'h-1.5' : 'h-2'}
          />
          {showLabel && (
            <span className="text-xs font-medium tabular-nums" style={{ color }}>
              {score}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>Health: {score}/100 ({label})</TooltipContent>
    </Tooltip>
  );
}
