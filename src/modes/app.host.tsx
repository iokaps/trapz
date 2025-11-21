import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { ConnectionsView } from '@/views/connections-view';
import { KmQrCode } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const App: React.FC = () => {
	useGlobalController();
	const { title } = config;
	const { started, gamePhase, currentRound, totalRounds, scores } = useSnapshot(
		globalStore.proxy
	);
	useDocumentTitle(title);

	if (kmClient.clientContext.mode !== 'host') {
		throw new Error('App host rendered in non-host mode');
	}

	const playerLink = generateLink(kmClient.clientContext.playerCode, {
		mode: 'player'
	});

	const presenterLink = generateLink(kmClient.clientContext.presenterCode, {
		mode: 'presenter',
		playerCode: kmClient.clientContext.playerCode
	});

	const handleStartGame = async () => {
		await gameActions.startGame();
	};

	const handleResetGame = async () => {
		await gameActions.resetGame();
	};

	const [selectedRounds, setSelectedRounds] = React.useState(5);

	const handleStartGameWithRounds = async () => {
		await gameActions.setTotalRounds(selectedRounds);
		await gameActions.startGame();
	};

	return (
		<HostPresenterLayout.Root>
			<HostPresenterLayout.Header>
				<div className="text-sm opacity-70">{config.hostLabel}</div>
			</HostPresenterLayout.Header>

			<HostPresenterLayout.Main>
				<div className="rounded-lg border border-gray-200 bg-white shadow-md">
					<div className="flex flex-col gap-2 p-6">
						<h2 className="text-xl font-bold">{config.gameLinksTitle}</h2>
						<KmQrCode data={playerLink} size={200} interactive={false} />
						<div className="flex gap-2">
							<a
								href={playerLink}
								target="_blank"
								rel="noreferrer"
								className="break-all text-blue-600 underline hover:text-blue-700"
							>
								{config.playerLinkLabel}
							</a>
							|
							<a
								href={presenterLink}
								target="_blank"
								rel="noreferrer"
								className="break-all text-blue-600 underline hover:text-blue-700"
							>
								{config.presenterLinkLabel}
							</a>
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<h2 className="mb-4 text-xl font-bold">Game Controls</h2>

					{!started ? (
						<div className="space-y-4">
							<div>
								<label className="mb-2 block text-sm font-semibold text-gray-700">
									{config.numberOfRoundsLabel}
								</label>
								<div className="flex items-center gap-3">
									<input
										type="range"
										min="3"
										max="10"
										value={selectedRounds}
										onChange={(e) => setSelectedRounds(Number(e.target.value))}
										className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
									/>
									<span className="min-w-[4rem] text-center text-xl font-bold text-blue-600">
										{selectedRounds}
									</span>
								</div>
								<div className="mt-1 text-sm text-gray-500">
									{selectedRounds} {config.roundsLabel}
								</div>
							</div>
							<button
								onClick={handleStartGameWithRounds}
								className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
							>
								{config.startButton}
							</button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="text-lg">
								<strong>Phase:</strong> {gamePhase}
							</div>
							<div className="text-lg">
								<strong>Round:</strong> {currentRound} / {totalRounds}
							</div>
							<button
								onClick={handleResetGame}
								className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
							>
								Reset Game
							</button>
						</div>
					)}
				</div>

				<ConnectionsView />

				{started && Object.keys(scores).length > 0 && (
					<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
						<h2 className="mb-4 text-xl font-bold">Current Scores</h2>
						<div className="space-y-2">
							{Object.entries(scores)
								.sort(([, a], [, b]) => b - a)
								.map(([clientId, score]) => (
									<div
										key={clientId}
										className="flex justify-between rounded bg-gray-50 p-3"
									>
										<span className="font-semibold">
											{globalStore.proxy.players[clientId]?.name || 'Unknown'}
										</span>
										<span className="font-bold text-blue-600">{score}</span>
									</div>
								))}
						</div>
					</div>
				)}
			</HostPresenterLayout.Main>
		</HostPresenterLayout.Root>
	);
};

export default App;
