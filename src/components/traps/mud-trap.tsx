import { cn } from '@/utils/cn';
import { Droplets } from 'lucide-react';
import * as React from 'react';

interface MudTrapProps {
	answerId: string;
	swipeCount: number;
	onSwipe: (answerId: string, newCount: number) => void;
	className?: string;
}

export const MudTrap: React.FC<MudTrapProps> = ({
	answerId,
	swipeCount,
	onSwipe,
	className
}) => {
	const [touchStart, setTouchStart] = React.useState<number | null>(null);
	const [lastSwipeY, setLastSwipeY] = React.useState<number | null>(null);
	const isCleared = swipeCount >= 8;

	const handleTouchStart = (e: React.TouchEvent) => {
		e.stopPropagation();
		setTouchStart(e.touches[0].clientY);
		setLastSwipeY(e.touches[0].clientY);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		e.stopPropagation();
		if (touchStart === null || lastSwipeY === null || isCleared) return;

		const currentY = e.touches[0].clientY;
		const distance = Math.abs(currentY - lastSwipeY);

		// Require 80px swipe distance from last swipe position
		if (distance > 80) {
			onSwipe(answerId, swipeCount + 1);
			// Update last swipe position to allow continuous swiping
			setLastSwipeY(currentY);
		}
	};

	const handleTouchEnd = () => {
		setTouchStart(null);
		setLastSwipeY(null);
	};

	if (isCleared) {
		return null;
	}

	// Calculate opacity based on swipe progress (fade gradually over 8 swipes)
	const opacity = 0.95 - swipeCount * 0.1;

	return (
		<div
			className={cn(
				'absolute inset-0 z-20 flex touch-none items-center justify-center rounded-2xl border-4 border-amber-900/40 shadow-2xl',
				'cursor-move select-none',
				className
			)}
			style={{
				background: `linear-gradient(135deg, rgba(120, 53, 15, ${opacity}) 0%, rgba(180, 83, 9, ${opacity}) 100%)`,
				backdropFilter: 'blur(6px)'
			}}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			<div className="pointer-events-none flex flex-col items-center gap-3">
				<div className="rounded-full bg-amber-900/30 p-4 shadow-lg backdrop-blur-sm">
					<Droplets className="h-20 w-20 text-amber-200 drop-shadow-xl" />
				</div>
				<div className="px-4 text-center text-2xl font-extrabold text-amber-100 drop-shadow-lg">
					Swipe {8 - swipeCount} more {swipeCount === 7 ? 'time' : 'times'}!
				</div>
			</div>
		</div>
	);
};
