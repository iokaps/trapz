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
import { motion } from 'motion/react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const QuestionView: React.FC = () => {
	const { currentQuestion } = useSnapshot(globalStore.proxy);
	const { hasAnswered, hasDoublePoints, iceTapProgress, mudSwipeProgress } =
		useSnapshot(playerStore.proxy);
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
		<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-1.5">
			<div className="rounded-lg border border-white/30 bg-gradient-to-br from-white to-purple-50 p-2.5 shadow-lg backdrop-blur-sm">
				<div className="mb-1 inline-block rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-md">
					{currentQuestion.categoryName}
				</div>
				<h2 className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-base leading-tight font-extrabold text-transparent">
					{currentQuestion.text}
				</h2>
			</div>

			<div className="rounded-lg border border-white/30 bg-gradient-to-br from-white to-pink-50 p-1.5 text-center shadow-lg backdrop-blur-sm">
				<div className="text-[10px] font-bold tracking-wide text-gray-700 uppercase">
					{config.timeRemaining}
				</div>
				<div className="text-xl font-extrabold text-pink-600">
					<KmTimeCountdown ms={timeRemaining} />
				</div>
			</div>

			{hasDoublePoints && (
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="animate-pulse-glow rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 p-2 text-center shadow-lg"
				>
					<p className="text-sm font-extrabold text-white drop-shadow-lg">
						⭐ 2X POINTS ACTIVE ⭐
					</p>
					<p className="text-[10px] text-white/90 drop-shadow-sm">
						Answer correctly for double points!
					</p>
				</motion.div>
			)}

			{myTraps.length > 0 && (
				<div className="animate-pulse-glow rounded-lg bg-gradient-to-r from-orange-400 to-red-500 p-1.5 text-center shadow-lg">
					<p className="text-[10px] font-bold text-white drop-shadow-md">
						{config.trapsActive}: {myTraps.length}
					</p>
				</div>
			)}

			<div className="grid grid-cols-2 gap-1.5">
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
						<motion.button
							key={answer.id}
							onClick={() => handleAnswerClick(answer.id)}
							disabled={hasAnswered}
							whileHover={
								!hasAnswered && iceCleared && mudCleared ? { scale: 1.05 } : {}
							}
							whileTap={
								!hasAnswered && iceCleared && mudCleared ? { scale: 0.95 } : {}
							}
							className={cn(
								'relative flex aspect-square min-h-[80px] items-center justify-center overflow-hidden rounded-lg border-2 p-2 text-center text-sm font-bold shadow-lg transition-all duration-300',
								hasAnswered
									? 'border-gray-400 bg-gray-200 opacity-60'
									: iceCleared && mudCleared
										? 'touch-manipulation border-white/50 bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm hover:border-blue-400 hover:shadow-2xl'
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
						</motion.button>
					);
				})}
			</div>

			{hasAnswered && (
				<div className="animate-slide-up rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 text-center shadow-lg">
					<p className="text-sm font-bold text-white drop-shadow-sm">
						{config.answerSubmitted}
					</p>
					<p className="text-xs text-white/90 drop-shadow-sm">
						{config.waitingForOtherPlayers}
					</p>
				</div>
			)}
		</div>
	);
};
