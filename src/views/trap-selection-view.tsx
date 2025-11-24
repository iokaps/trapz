import { config } from '@/config';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import type { SelectionType, TrapType } from '@/types/game';
import { cn } from '@/utils/cn';
import { KmTimeCountdown } from '@kokimoki/shared';
import { Droplets, Shuffle, Snowflake, Sparkles, Type } from 'lucide-react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const TRAP_ICONS: Record<TrapType, React.FC<{ className?: string }>> = {
	ice: Snowflake,
	mud: Droplets,
	'mixed-letters': Shuffle,
	'missing-letters': Type
};

const SELECTION_ICONS: Record<
	SelectionType,
	React.FC<{ className?: string }>
> = {
	...TRAP_ICONS,
	'double-points': Sparkles
};

export const TrapSelectionView: React.FC = () => {
	const { trapSelection, players, totalQuestionsAsked } = useSnapshot(
		globalStore.proxy
	);
	const { selectedTrap } = useSnapshot(playerStore.proxy);
	const [selectingTrap, setSelectingTrap] =
		React.useState<SelectionType | null>(null);
	const serverTime = useServerTimer();

	if (!trapSelection) {
		return <div className="text-center">{config.loading}</div>;
	}

	const timeRemaining = Math.max(0, trapSelection.endTimestamp - serverTime);
	const hasSelected = trapSelection.selections[kmClient.id] === true;

	// Check if double points is available (every 5th question)
	const isDoublePointsRound = (totalQuestionsAsked + 1) % 5 === 0;
	const questionsUntilDoublePoints = 5 - ((totalQuestionsAsked + 1) % 5);

	// All traps are available before each question (unlimited inventory)
	const trapTypes: TrapType[] = [
		'ice',
		'mud',
		'mixed-letters',
		'missing-letters'
	];

	const handleTrapSelect = (trapType: TrapType) => {
		if (hasSelected) return;
		setSelectingTrap(trapType);
	};

	const handleDoublePointsSelect = async () => {
		if (hasSelected || !isDoublePointsRound) return;
		// Auto-target self for double points
		await gameActions.selectTrap('double-points', kmClient.id);
	};

	const handleTargetSelect = async (targetClientId: string) => {
		if (!selectingTrap || hasSelected) return;
		await gameActions.selectTrap(selectingTrap, targetClientId);
		setSelectingTrap(null);
	};

	const handleBack = () => {
		setSelectingTrap(null);
	};

	// Get other players (exclude self)
	const otherPlayers = Object.entries(players).filter(
		([clientId]) => clientId !== kmClient.id
	);

	return (
		<div className="animate-slide-up flex w-full max-w-4xl flex-col gap-1.5">
			<div className="text-center text-slate-800">
				<h1 className="text-xl font-extrabold drop-shadow-sm">
					{config.trapSelectionTitle}
				</h1>
				<p className="text-xs drop-shadow-sm">
					{config.trapSelectionDescription}
				</p>
			</div>

			<div className="rounded-lg border border-white/30 bg-gradient-to-br from-white to-orange-50 p-1.5 text-center shadow-lg backdrop-blur-sm">
				<div className="text-[10px] font-bold tracking-wide text-gray-700 uppercase">
					{config.timeRemaining}
				</div>
				<div className="text-2xl font-extrabold text-orange-600">
					<KmTimeCountdown ms={timeRemaining} />
				</div>
			</div>

			{!selectingTrap && !hasSelected && (
				<>
					{/* Show countdown to double points if not available */}
					{!isDoublePointsRound && questionsUntilDoublePoints <= 3 && (
						<div className="rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 p-2 text-center">
							<div className="text-xs font-bold text-amber-800">
								⭐ Double Points in {questionsUntilDoublePoints}{' '}
								{questionsUntilDoublePoints === 1 ? 'question' : 'questions'}!
							</div>
						</div>
					)}

					{/* Show double points available banner */}
					{isDoublePointsRound && (
						<div className="animate-pulse-glow rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 p-2.5 text-center shadow-lg">
							<div className="text-base font-extrabold text-white drop-shadow-lg">
								⭐ DOUBLE POINTS AVAILABLE! ⭐
							</div>
						</div>
					)}

					{/* Double Points Option - Featured prominently when available */}
					{isDoublePointsRound && (
						<button
							onClick={handleDoublePointsSelect}
							className={cn(
								'flex flex-col items-center justify-center gap-2 rounded-xl border-4 p-5',
								'border-yellow-300 bg-gradient-to-br from-yellow-400 via-amber-400 to-amber-500 shadow-2xl transition-all duration-300',
								'touch-manipulation hover:scale-105 hover:shadow-2xl active:scale-95',
								'animate-pulse-glow backdrop-blur-sm',
								'min-h-[140px]'
							)}
						>
							<Sparkles className="h-16 w-16 animate-pulse text-white drop-shadow-2xl" />
							<div className="flex flex-col items-center gap-1">
								<span className="text-xl font-extrabold text-white drop-shadow-lg">
									⭐ DOUBLE POINTS ⭐
								</span>
								<span className="text-xs font-bold text-white/95 drop-shadow-sm">
									Answer correctly for 2x points!
								</span>
							</div>
						</button>
					)}

					<div className={cn('grid gap-1.5', 'grid-cols-2')}>
						{trapTypes.map((trapType) => {
							const Icon = TRAP_ICONS[trapType];
							const gradients = {
								ice: 'from-cyan-400 to-blue-500',
								mud: 'from-amber-600 to-orange-700',
								'mixed-letters': 'from-purple-500 to-pink-600',
								'missing-letters': 'from-indigo-500 to-purple-600'
							};
							return (
								<button
									key={trapType}
									onClick={() => handleTrapSelect(trapType)}
									className={cn(
										'flex min-h-[80px] flex-col items-center gap-1 rounded-lg border-2 p-2.5',
										'border-white/50 bg-gradient-to-br shadow-lg transition-all duration-300',
										'touch-manipulation hover:scale-105 hover:shadow-2xl active:scale-95',
										'backdrop-blur-sm',
										gradients[trapType],
										isDoublePointsRound && 'opacity-70'
									)}
								>
									<Icon className="h-10 w-10 text-white drop-shadow-lg" />
									<span className="text-sm font-bold text-white capitalize drop-shadow-md">
										{trapType.replace('-', ' ')}
									</span>
								</button>
							);
						})}
					</div>
				</>
			)}

			{selectingTrap && !hasSelected && (
				<div className="flex flex-col gap-1.5">
					<button
						onClick={handleBack}
						className="self-start rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-blue-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
					>
						← {config.backButton}
					</button>

					<h2 className="text-base font-bold text-slate-800 drop-shadow-sm">
						{config.selectTargetPlayer}
					</h2>

					<div className="grid gap-1.5">
						{otherPlayers.map(([clientId, player]) => (
							<button
								key={clientId}
								onClick={() => handleTargetSelect(clientId)}
								className={cn(
									'rounded-lg border-2 p-2.5 text-left',
									'border-white/50 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300',
									'touch-manipulation hover:scale-105 hover:border-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:shadow-2xl active:scale-95'
								)}
							>
								<div className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-base font-bold text-transparent">
									{player.name}
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{hasSelected && selectedTrap && (
				<div className="animate-slide-up flex flex-col gap-1.5">
					<div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 text-center shadow-lg">
						<div className="text-base font-bold text-white drop-shadow-sm">
							{config.trapSelected}
						</div>
						<div className="text-xs text-white/90 drop-shadow-sm">
							{config.waitingForOtherPlayers}
						</div>
					</div>

					<div className="rounded-xl border-2 border-green-400 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
						<div className="text-xs font-bold tracking-wide text-gray-700 uppercase">
							{config.yourSelection}
						</div>
						<div className="mt-2 flex items-center justify-center gap-2">
							{React.createElement(SELECTION_ICONS[selectedTrap.type], {
								className: 'h-8 w-8 text-green-600'
							})}
							<span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-base font-bold text-transparent capitalize">
								{selectedTrap.type === 'double-points'
									? '⭐ Double Points'
									: selectedTrap.type.replace('-', ' ')}
							</span>
							{selectedTrap.type !== 'double-points' && (
								<>
									<span className="text-xl text-green-600">→</span>
									<span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-base font-bold text-transparent">
										{players[selectedTrap.targetClientId]?.name}
									</span>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
