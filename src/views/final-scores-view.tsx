import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { KmPodiumTable } from '@kokimoki/shared';
import { Trophy } from 'lucide-react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const FinalScoresView: React.FC = () => {
	const { scores, players } = useSnapshot(globalStore.proxy);
	const isHost = kmClient.clientContext.mode === 'host';

	// Create leaderboard data
	const leaderboard = Object.entries(scores)
		.map(([clientId, score]) => ({
			clientId,
			name: players[clientId]?.name || 'Unknown',
			score
		}))
		.sort((a, b) => b.score - a.score);

	const myScore = scores[kmClient.id] || 0;
	const myRank =
		leaderboard.findIndex((entry) => entry.clientId === kmClient.id) + 1;

	// Prepare podium data (top 3)
	const podiumData = leaderboard.slice(0, 3).map((entry) => ({
		id: entry.clientId,
		name: entry.name,
		points: entry.score
	}));

	const handlePlayAgain = async () => {
		await gameActions.resetGame();
	};

	return (
		<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-1.5">
			<div className="text-center text-slate-800">
				<div className="inline-block rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 p-3 shadow-lg">
					<Trophy className="h-16 w-16 text-yellow-900 drop-shadow-lg" />
				</div>
				<h1 className="mt-4 text-3xl font-extrabold drop-shadow-sm">
					{config.finalScoresTitle}
				</h1>
			</div>

			<div className="rounded-xl border-2 border-white/30 bg-gradient-to-br from-white to-purple-50 p-6 shadow-lg backdrop-blur-sm">
				<div className="text-center">
					<div className="text-xs font-bold tracking-wide text-gray-700 uppercase">
						{config.yourFinalScore}
					</div>
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-extrabold text-transparent">
						{myScore}
					</div>
					<div className="mt-2 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-base font-bold text-white shadow-lg">
						{config.rank}: #{myRank}
					</div>
				</div>
			</div>

			{podiumData.length > 0 && (
				<div className="rounded-xl border border-white/30 bg-white/90 p-4 shadow-lg backdrop-blur-sm">
					<h2 className="mb-3 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-center text-xl font-extrabold text-transparent">
						{config.topPlayers}
					</h2>
					<KmPodiumTable entries={podiumData} />
				</div>
			)}

			<div className="rounded-xl border border-white/30 bg-white/90 p-4 shadow-lg backdrop-blur-sm">
				<h2 className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-base font-extrabold text-transparent">
					{config.fullLeaderboard}
				</h2>
				<div className="space-y-1.5">
					{leaderboard.map((entry, index) => (
						<div
							key={entry.clientId}
							className={cn(
								'flex items-center justify-between rounded-lg p-2.5 shadow-md transition-all duration-300',
								entry.clientId === kmClient.id
									? 'scale-105 border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50'
									: 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg'
							)}
						>
							<div className="flex items-center gap-2">
								<div
									className={cn(
										'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-md',
										index === 0
											? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900'
											: index === 1
												? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
												: index === 2
													? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900'
													: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'
									)}
								>
									{index + 1}
								</div>
								<div className="text-sm font-bold text-gray-800">
									{entry.name}
								</div>
							</div>
							<div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-extrabold text-transparent">
								{entry.score}
							</div>
						</div>
					))}
				</div>
			</div>

			{isHost && (
				<button
					onClick={handlePlayAgain}
					className={cn(
						'rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-base font-bold text-white shadow-lg',
						'touch-manipulation transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 active:scale-95'
					)}
				>
					{config.playAgainButton}
				</button>
			)}
		</div>
	);
};
