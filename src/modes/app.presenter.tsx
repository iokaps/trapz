import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { ConnectionsView } from '@/views/connections-view';
import { KmQrCode } from '@kokimoki/shared';
import { Trophy } from 'lucide-react';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const App: React.FC = () => {
	const { title } = config;
	const { started, scores, players } = useSnapshot(globalStore.proxy);

	useGlobalController();
	useDocumentTitle(title);

	if (kmClient.clientContext.mode !== 'presenter') {
		throw new Error('App presenter rendered in non-presenter mode');
	}

	const playerLink = generateLink(kmClient.clientContext.playerCode, {
		mode: 'player'
	});

	return (
		<HostPresenterLayout.Root>
			<HostPresenterLayout.Header>
				<div className="text-sm opacity-70">{config.presenterLabel}</div>
			</HostPresenterLayout.Header>

			<HostPresenterLayout.Main>
				{started && Object.keys(scores).length > 0 ? (
					<div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-white to-yellow-50 p-8 shadow-2xl">
						<div className="mb-6 flex items-center justify-center gap-3">
							<Trophy className="h-12 w-12 text-yellow-600" />
							<h2 className="text-4xl font-extrabold text-gray-800">
								Live Leaderboard
							</h2>
						</div>

						<div className="space-y-3">
							{Object.entries(scores)
								.sort(([, a], [, b]) => b - a)
								.map(([clientId, score], index) => {
									const rank = index + 1;
									const playerName = players[clientId]?.name || 'Unknown';

									return (
										<div
											key={clientId}
											className={`flex items-center justify-between rounded-xl border-2 p-4 shadow-lg transition-all duration-300 ${
												rank === 1
													? 'animate-pulse-glow border-yellow-400 bg-gradient-to-r from-yellow-100 to-yellow-200'
													: rank === 2
														? 'border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200'
														: rank === 3
															? 'border-orange-300 bg-gradient-to-r from-orange-100 to-orange-200'
															: 'border-gray-200 bg-white'
											}`}
										>
											<div className="flex items-center gap-4">
												<div
													className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl font-extrabold ${
														rank === 1
															? 'bg-yellow-500 text-white'
															: rank === 2
																? 'bg-gray-400 text-white'
																: rank === 3
																	? 'bg-orange-500 text-white'
																	: 'bg-gray-200 text-gray-600'
													}`}
												>
													{rank}
												</div>
												<span className="text-2xl font-bold text-gray-800">
													{playerName}
												</span>
											</div>
											<div className="text-3xl font-extrabold text-blue-600">
												{score}
											</div>
										</div>
									);
								})}
						</div>
					</div>
				) : (
					<>
						<div className="rounded-lg border border-gray-200 bg-white shadow-md">
							<div className="flex flex-col gap-2 p-6">
								<h2 className="text-xl font-bold">{config.playerLinkLabel}</h2>
								<KmQrCode data={playerLink} size={200} interactive={false} />

								<a
									href={playerLink}
									target="_blank"
									rel="noreferrer"
									className="break-all text-blue-600 underline hover:text-blue-700"
								>
									{config.playerLinkLabel}
								</a>
							</div>
						</div>

						<ConnectionsView />
					</>
				)}
			</HostPresenterLayout.Main>
		</HostPresenterLayout.Root>
	);
};

export default App;
