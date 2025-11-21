import { cn } from '@/utils/cn';
import { Snowflake } from 'lucide-react';
import * as React from 'react';

interface IceTrapProps {
	answerId: string;
	tapCount: number;
	onTap: (answerId: string, newCount: number) => void;
	className?: string;
}

export const IceTrap: React.FC<IceTrapProps> = ({
	answerId,
	tapCount,
	onTap,
	className
}) => {
	const isBroken = tapCount >= 3;

	const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isBroken) {
			onTap(answerId, tapCount + 1);
		}
	};

	if (isBroken) {
		return null;
	}

	return (
		<div
			className={cn(
				'absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 backdrop-blur-md',
				'cursor-pointer select-none',
				'touch-none active:from-cyan-500 active:via-blue-600 active:to-blue-700',
				'border-4 border-white/30 shadow-2xl',
				className
			)}
			onClick={handleTap}
			onTouchStart={handleTap}
		>
			<div className="flex flex-col items-center gap-3">
				<div className="rounded-full bg-white/20 p-4 shadow-lg backdrop-blur-sm">
					<Snowflake className="h-20 w-20 animate-pulse text-white drop-shadow-2xl" />
				</div>
				<div className="px-4 text-center text-2xl font-extrabold text-white drop-shadow-lg">
					Tap {3 - tapCount} more {tapCount === 2 ? 'time' : 'times'}!
				</div>
			</div>
		</div>
	);
};
