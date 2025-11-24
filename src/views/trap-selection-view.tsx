import { config } from '@/config';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import type { TrapType } from '@/types/game';
import { cn } from '@/utils/cn';
import { KmTimeCountdown } from '@kokimoki/shared';
import { Droplets, Shuffle, Snowflake, Type } from 'lucide-react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const TRAP_ICONS: Record<TrapType, React.FC<{ className?: string }>> = {
	ice: Snowflake,
	mud: Droplets,
	'mixed-letters': Shuffle,
	'missing-letters': Type
};

export const TrapSelectionView: React.FC = () => {
	const { trapSelection, players, gamePhase } = useSnapshot(globalStore.proxy);
	const { selectedTrap } = useSnapshot(playerStore.proxy);
	const [selectingTrap, setSelectingTrap] = React.useState<TrapType | null>(
		null
	);
	const serverTime = useServerTimer();

	if (!trapSelection) {
		return <div className="text-center">{config.loading}</div>;
	}

	const timeRemaining = Math.max(0, trapSelection.endTimestamp - serverTime);
	const hasSelected = trapSelection.selections[kmClient.id] === true;

	// Show loading state when time expires and still in trap-selection (waiting for question generation)
	const isGeneratingQuestion =
		timeRemaining === 0 && gamePhase === 'trap-selection';

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

	// Show loading message when generating question
	if (isGeneratingQuestion) {
		return (
			<div className="animate-slide-up flex w-full max-w-4xl flex-col gap-4">
				<div className="rounded-2xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center shadow-2xl">
					<div className="mb-4 flex justify-center">
						<div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
					</div>
					<h2 className="text-2xl font-bold text-slate-800">
						Generating Question...
					</h2>
					<p className="mt-2 text-base text-slate-600">
						Preparing your trivia challenge!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="animate-slide-up flex w-full max-w-4xl flex-col gap-2">
			<div className="text-center text-slate-800">
				<h1 className="text-2xl font-extrabold drop-shadow-sm">
					{config.trapSelectionTitle}
				</h1>
				<p className="mt-0.5 text-sm drop-shadow-sm">
					{config.trapSelectionDescription}
				</p>
			</div>

			<div className="rounded-xl border border-white/30 bg-gradient-to-br from-white to-orange-50 p-2.5 text-center shadow-2xl backdrop-blur-sm">
				<div className="text-xs font-bold tracking-wide text-gray-700 uppercase">
					{config.timeRemaining}
				</div>
				<div className="text-3xl font-extrabold text-orange-600">
					<KmTimeCountdown ms={timeRemaining} />
				</div>
			</div>

			{!selectingTrap && !hasSelected && (
				<div className="grid grid-cols-2 gap-2.5">
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
									'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5',
									'border-white/50 bg-gradient-to-br shadow-xl transition-all duration-300',
									'touch-manipulation hover:scale-105 hover:shadow-2xl active:scale-95',
									'backdrop-blur-sm',
									gradients[trapType]
								)}
							>
								<Icon className="h-12 w-12 text-white drop-shadow-lg" />
								<span className="text-base font-bold text-white capitalize drop-shadow-md">
									{trapType.replace('-', ' ')}
								</span>
							</button>
						);
					})}
				</div>
			)}

			{selectingTrap && !hasSelected && (
				<div className="flex flex-col gap-2.5">
					<button
						onClick={handleBack}
						className="self-start rounded-lg bg-white/90 px-3 py-1.5 text-sm font-bold text-blue-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
					>
						← {config.backButton}
					</button>

					<h2 className="text-lg font-bold text-slate-800 drop-shadow-sm">
						{config.selectTargetPlayer}
					</h2>

					<div className="grid gap-2">
						{otherPlayers.map(([clientId, player]) => (
							<button
								key={clientId}
								onClick={() => handleTargetSelect(clientId)}
								className={cn(
									'rounded-xl border-2 p-3.5 text-left',
									'border-white/50 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300',
									'touch-manipulation hover:scale-105 hover:border-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:shadow-2xl active:scale-95'
								)}
							>
								<div className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-lg font-bold text-transparent">
									{player.name}
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{hasSelected && selectedTrap && (
				<div className="animate-slide-up flex flex-col gap-2.5">
					<div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-center shadow-xl">
						<div className="text-lg font-bold text-white drop-shadow-sm">
							{config.trapSelected}
						</div>
						<div className="mt-1 text-sm text-white/90 drop-shadow-sm">
							{config.waitingForOtherPlayers}
						</div>
					</div>

					<div className="rounded-2xl border-2 border-green-400 bg-white/90 p-6 shadow-xl backdrop-blur-sm">
						<div className="text-sm font-bold tracking-wide text-gray-700 uppercase">
							{config.yourSelection}
						</div>
						<div className="mt-3 flex items-center justify-center gap-3">
							{React.createElement(TRAP_ICONS[selectedTrap.type], {
								className: 'h-10 w-10 text-green-600'
							})}
							<span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-xl font-bold text-transparent capitalize">
								{selectedTrap.type.replace('-', ' ')}
							</span>
							<span className="text-2xl text-green-600">→</span>
							<span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-xl font-bold text-transparent">
								{players[selectedTrap.targetClientId]?.name}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
