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
	const { lastQuestionResult, currentQuestion } = useSnapshot(
		globalStore.proxy
	);
	const serverTime = useServerTimer();

	if (!lastQuestionResult || !currentQuestion) {
		return <div className="text-center">{config.loading}</div>;
	}

	const myResult = lastQuestionResult.playerResults[kmClient.id];
	const correctAnswer = currentQuestion.answers.find(
		(a) => a.id === lastQuestionResult.correctAnswerId
	);

	if (!myResult) {
		return (
			<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-6">
				<div className="rounded-2xl bg-white/90 p-10 text-center shadow-2xl backdrop-blur-sm">
					<p className="text-xl font-bold text-gray-700">
						{config.didNotAnswer}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="animate-slide-up flex w-full max-w-2xl flex-col gap-6">
			<div
				className={cn(
					'rounded-3xl p-10 text-center shadow-2xl',
					myResult.isCorrect
						? 'bg-gradient-to-br from-green-400 to-emerald-600'
						: 'bg-gradient-to-br from-red-400 to-rose-600'
				)}
			>
				<div className="flex justify-center">
					{myResult.isCorrect ? (
						<div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
							<Check className="h-20 w-20 text-white drop-shadow-lg" />
						</div>
					) : (
						<div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
							<X className="h-20 w-20 text-white drop-shadow-lg" />
						</div>
					)}
				</div>
				<h2 className="mt-6 text-4xl font-extrabold text-white drop-shadow-sm">
					{myResult.isCorrect ? config.correct : config.incorrect}
				</h2>
			</div>{' '}
			<div className="rounded-2xl border border-white/30 bg-gradient-to-br from-white to-blue-50 p-8 shadow-2xl backdrop-blur-sm">
				<div className="text-center">
					<div className="text-sm font-bold tracking-wide text-gray-700 uppercase">
						{config.pointsEarned}
					</div>
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-extrabold text-transparent">
						{myResult.pointsEarned}
					</div>
				</div>

				<div className="mt-8 grid grid-cols-2 gap-6 border-t-2 border-gray-200 pt-6">
					<div className="text-center">
						<div className="text-sm font-bold tracking-wide text-gray-600 uppercase">
							{config.yourTime}
						</div>
						<div className="text-2xl font-extrabold text-gray-800">
							{(myResult.timeToAnswer / 1000).toFixed(1)}s
						</div>
					</div>
					<div className="text-center">
						<div className="text-sm font-bold tracking-wide text-gray-600 uppercase">
							{config.yourAnswer}
						</div>
						<div className="text-2xl font-extrabold break-words text-gray-800">
							{
								currentQuestion.answers.find((a) => a.id === myResult.answerId)
									?.text
							}
						</div>
					</div>
				</div>
			</div>
			{!myResult.isCorrect && (
				<div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 shadow-xl">
					<div className="text-center">
						<div className="text-sm font-bold tracking-wide text-white/90 uppercase">
							{config.correctAnswerWas}
						</div>
						<div className="mt-3 text-2xl font-extrabold text-white drop-shadow-md">
							{correctAnswer?.text}
						</div>
					</div>
				</div>
			)}
			<div className="rounded-2xl border border-white/30 bg-gradient-to-br from-white to-green-50 p-6 text-center shadow-2xl backdrop-blur-sm">
				<div className="text-sm font-bold tracking-wide text-gray-700 uppercase">
					{config.nextRoundStartingSoon}
				</div>
				<div className="text-4xl font-extrabold text-green-600">
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
