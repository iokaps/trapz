import { IceTrap } from '@/components/traps/ice-trap';
import { MissingLettersTrap } from '@/components/traps/missing-letters-trap';
import { MixedLettersTrap } from '@/components/traps/mixed-letters-trap';
import { MudTrap } from '@/components/traps/mud-trap';
import { config } from '@/config';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { cn } from '@/utils/cn';
import { KmTimeCountdown } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const QuestionView: React.FC = () => {
	const { currentQuestion } = useSnapshot(globalStore.proxy);
	const { hasAnswered, iceTapProgress, mudSwipeProgress } = useSnapshot(
		playerStore.proxy
	);
	const serverTime = useServerTimer();

	if (!currentQuestion) {
		return <div className="text-center">{config.loading}</div>;
	}

	const timeRemaining = Math.max(0, currentQuestion.endTimestamp - serverTime);
	const myTraps = currentQuestion.trapsApplied[kmClient.id] || [];
	const hasIceTrap = myTraps.includes('ice');
	const hasMudTrap = myTraps.includes('mud');
	const hasMixedLetters = myTraps.includes('mixed-letters');
	const hasMissingLetters = myTraps.includes('missing-letters');

	const handleAnswerClick = async (answerId: string) => {
		if (hasAnswered) return;

		// Check if ice/mud traps are cleared for this answer
		if (hasIceTrap && (iceTapProgress[answerId] || 0) < 3) {
			return; // Ice not broken yet
		}
		if (hasMudTrap && (mudSwipeProgress[answerId] || 0) < 3) {
			return; // Mud not cleared yet
		}

		await gameActions.submitAnswer(answerId);
	};

	const handleIceTap = async (answerId: string, newCount: number) => {
		await gameActions.updateIceTapProgress(answerId, newCount);
	};

	const handleMudSwipe = async (answerId: string, newCount: number) => {
		await gameActions.updateMudSwipeProgress(answerId, newCount);
	};

	return (
		<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-6">
			<div className="rounded-2xl border border-white/30 bg-gradient-to-br from-white to-purple-50 p-6 shadow-2xl backdrop-blur-sm">
				<div className="mb-3 inline-block rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-md">
					{currentQuestion.categoryName}
				</div>
				<h2 className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-3xl leading-tight font-extrabold text-transparent">
					{currentQuestion.text}
				</h2>
			</div>

			<div className="rounded-2xl border border-white/30 bg-gradient-to-br from-white to-pink-50 p-6 text-center shadow-2xl backdrop-blur-sm">
				<div className="text-sm font-bold tracking-wide text-gray-700 uppercase">
					{config.timeRemaining}
				</div>
				<div className="text-4xl font-extrabold text-pink-600">
					<KmTimeCountdown ms={timeRemaining} />
				</div>
			</div>

			{myTraps.length > 0 && (
				<div className="animate-pulse-glow rounded-xl bg-gradient-to-r from-orange-400 to-red-500 p-4 text-center shadow-lg">
					<p className="text-sm font-bold text-white drop-shadow-md">
						{config.trapsActive}: {myTraps.length}
					</p>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4">
				{currentQuestion.answers.map((answer) => {
					const iceTaps = iceTapProgress[answer.id] || 0;
					const mudSwipes = mudSwipeProgress[answer.id] || 0;
					const iceCleared = !hasIceTrap || iceTaps >= 3;
					const mudCleared = !hasMudTrap || mudSwipes >= 3;
					let displayText = answer.text;
					if (hasMixedLetters && !hasAnswered) {
						displayText = (<MixedLettersTrap text={answer.text} />) as any;
					} else if (hasMissingLetters && !hasAnswered) {
						displayText = (<MissingLettersTrap text={answer.text} />) as any;
					}

					return (
						<button
							key={answer.id}
							onClick={() => handleAnswerClick(answer.id)}
							disabled={hasAnswered}
							className={cn(
								'relative flex aspect-square min-h-[120px] items-center justify-center overflow-hidden rounded-2xl border-2 p-4 text-center text-lg font-bold shadow-lg transition-all duration-300',
								hasAnswered
									? 'border-gray-400 bg-gray-200 opacity-60'
									: iceCleared && mudCleared
										? 'touch-manipulation border-white/50 bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm hover:scale-105 hover:border-blue-400 hover:shadow-2xl active:scale-95'
										: 'border-white/50 bg-white/70 backdrop-blur-sm'
							)}
						>
							<span
								className={cn(
									!iceCleared || !mudCleared
										? 'opacity-30'
										: 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'
								)}
							>
								{displayText}
							</span>

							{hasIceTrap && !iceCleared && (
								<IceTrap
									answerId={answer.id}
									tapCount={iceTaps}
									onTap={handleIceTap}
								/>
							)}

							{hasMudTrap && !mudCleared && (
								<MudTrap
									answerId={answer.id}
									swipeCount={mudSwipes}
									onSwipe={handleMudSwipe}
								/>
							)}
						</button>
					);
				})}
			</div>

			{hasAnswered && (
				<div className="animate-slide-up rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center shadow-xl">
					<p className="text-xl font-bold text-white drop-shadow-sm">
						{config.answerSubmitted}
					</p>
					<p className="mt-2 text-white/90 drop-shadow-sm">
						{config.waitingForOtherPlayers}
					</p>
				</div>
			)}
		</div>
	);
};
