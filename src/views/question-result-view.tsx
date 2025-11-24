import { config } from '@/config';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { KmTimeCountdown } from '@kokimoki/shared';
import { Check, X } from 'lucide-react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const QuestionResultView: React.FC = () => {
	const { lastQuestionResult, currentQuestion, activeDoublePoints } =
		useSnapshot(globalStore.proxy);
	const serverTime = useServerTimer();

	if (!lastQuestionResult || !currentQuestion) {
		return <div className="text-center">{config.loading}</div>;
	}

	const myResult = lastQuestionResult.playerResults[kmClient.id];
	const hadDoublePoints = activeDoublePoints[kmClient.id] || false;
	const correctAnswer = currentQuestion.answers.find(
		(a) => a.id === lastQuestionResult.correctAnswerId
	);

	if (!myResult) {
		return (
			<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-1.5">
				<div className="rounded-lg bg-white/90 p-4 text-center shadow-lg backdrop-blur-sm">
					<p className="text-base font-bold text-gray-700">
						{config.didNotAnswer}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-1.5">
			<div
				className={cn(
					'rounded-xl p-4 text-center shadow-lg',
					myResult.isCorrect
						? 'bg-gradient-to-br from-green-400 to-emerald-600'
						: 'bg-gradient-to-br from-red-400 to-rose-600'
				)}
			>
				<div className="flex justify-center">
					{myResult.isCorrect ? (
						<div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
							<Check className="h-10 w-10 text-white drop-shadow-lg" />
						</div>
					) : (
						<div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
							<X className="h-10 w-10 text-white drop-shadow-lg" />
						</div>
					)}
				</div>
				<h2 className="mt-2 text-xl font-extrabold text-white drop-shadow-sm">
					{myResult.isCorrect ? config.correct : config.incorrect}
				</h2>
			</div>
			<div className="rounded-lg border border-white/30 bg-gradient-to-br from-white to-blue-50 p-2.5 shadow-lg backdrop-blur-sm">
				<div className="text-center">
					<div className="text-[10px] font-bold tracking-wide text-gray-700 uppercase">
						{config.pointsEarned}
					</div>
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent">
						{myResult.pointsEarned}
						{hadDoublePoints && (
							<span className="ml-1.5 text-xl text-yellow-600">(2X)</span>
						)}
					</div>
				</div>

				<div className="mt-2 grid grid-cols-2 gap-2 border-t-2 border-gray-200 pt-2">
					<div className="text-center">
						<div className="text-[10px] font-bold tracking-wide text-gray-600 uppercase">
							{config.yourTime}
						</div>
						<div className="text-base font-extrabold text-gray-800">
							{(myResult.timeToAnswer / 1000).toFixed(1)}s
						</div>
					</div>
					<div className="text-center">
						<div className="text-[10px] font-bold tracking-wide text-gray-600 uppercase">
							{config.yourAnswer}
						</div>
						<div className="text-sm font-extrabold break-words text-gray-800">
							{
								currentQuestion.answers.find((a) => a.id === myResult.answerId)
									?.text
							}
						</div>
					</div>
				</div>
			</div>
			{!myResult.isCorrect && (
				<div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-3 shadow-lg">
					<div className="text-center">
						<div className="text-[10px] font-bold tracking-wide text-white/90 uppercase">
							{config.correctAnswerWas}
						</div>
						<div className="mt-1 text-base font-extrabold text-white drop-shadow-md">
							{correctAnswer?.text}
						</div>
					</div>
				</div>
			)}
			<div className="rounded-lg border border-white/30 bg-gradient-to-br from-white to-green-50 p-1.5 text-center shadow-lg backdrop-blur-sm">
				<div className="text-[10px] font-bold tracking-wide text-gray-700 uppercase">
					{config.nextRoundStartingSoon}
				</div>
				<div className="text-2xl font-extrabold text-green-600">
					<KmTimeCountdown
						ms={Math.max(
							0,
							5000 - (serverTime - (lastQuestionResult?.shownTimestamp || 0))
						)}
					/>
				</div>
			</div>
		</div>
	);
};
