import { config } from '@/config';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { KmTimeCountdown } from '@kokimoki/shared';
import { Check } from 'lucide-react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const CategoryVotingView: React.FC = () => {
	const { categoryVoting } = useSnapshot(globalStore.proxy);
	const serverTime = useServerTimer();

	if (!categoryVoting) {
		return <div className="text-center">{config.loading}</div>;
	}

	const timeRemaining = Math.max(0, categoryVoting.endTimestamp - serverTime);
	const hasVoted = categoryVoting.votes[kmClient.id] !== undefined;
	const myVote = categoryVoting.votes[kmClient.id];

	const handleVote = async (categoryId: string) => {
		if (hasVoted) return;
		await gameActions.submitCategoryVote(categoryId);
	};

	// Count votes for each category
	const voteCounts: Record<string, number> = {};
	Object.values(categoryVoting.votes).forEach((categoryId) => {
		voteCounts[categoryId] = (voteCounts[categoryId] || 0) + 1;
	});

	return (
		<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-1.5">
			<div className="text-center text-slate-800">
				<h1 className="text-xl font-extrabold drop-shadow-sm">
					{config.categoryVotingTitle}
				</h1>
				<p className="text-xs drop-shadow-sm">
					{config.categoryVotingDescription}
				</p>
			</div>

			<div className="rounded-lg border border-white/30 bg-gradient-to-br from-white to-blue-50 p-1.5 text-center shadow-lg backdrop-blur-sm">
				<div className="text-[10px] font-bold tracking-wide text-gray-700 uppercase">
					{config.timeRemaining}
				</div>
				<div className="text-2xl font-extrabold text-blue-600">
					<KmTimeCountdown ms={timeRemaining} />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-1.5">
				{categoryVoting.categories.map((category) => {
					const votes = voteCounts[category.id] || 0;
					const isMyVote = myVote === category.id;

					return (
						<button
							key={category.id}
							onClick={() => handleVote(category.id)}
							disabled={hasVoted}
							className={cn(
								'relative rounded-xl border-2 p-2.5 text-left transition-all duration-300',
								'touch-manipulation shadow-lg hover:shadow-2xl active:scale-95',
								isMyVote
									? 'animate-pulse-glow border-green-400 bg-gradient-to-br from-green-50 to-emerald-100'
									: 'border-white/50 bg-white/90 backdrop-blur-sm hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50',
								hasVoted && !isMyVote && 'opacity-50'
							)}
						>
							{isMyVote && (
								<div className="absolute top-2 right-2 rounded-full bg-green-500 p-0.5">
									<Check className="h-4 w-4 text-white" />
								</div>
							)}
							<h3 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-base font-bold text-transparent">
								{category.name}
							</h3>
							<p className="mt-1 text-sm font-medium text-gray-700">
								{category.description}
							</p>
							{votes > 0 && (
								<div className="mt-2 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
									{votes} {votes === 1 ? 'vote' : 'votes'}
								</div>
							)}
						</button>
					);
				})}
			</div>

			{hasVoted && (
				<div className="animate-slide-up rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 text-center shadow-lg">
					<p className="text-sm font-bold text-white drop-shadow-md">
						{config.waitingForOtherPlayers}
					</p>
				</div>
			)}
		</div>
	);
};
