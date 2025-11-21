import { config } from '@/config';
import { playerActions } from '@/state/actions/player-actions';
import { cn } from '@/utils/cn';
import * as React from 'react';

interface Props {
	className?: string;
}

/**
 * View to create a player profile by entering a name
 */
export const CreateProfileView: React.FC<Props> = ({ className }) => {
	const [name, setName] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedName = name.trim();
		if (!trimmedName) return;

		setIsLoading(true);
		try {
			await playerActions.setPlayerName(trimmedName);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={cn(
				'animate-slide-up w-full max-w-96 rounded-3xl border-2 border-white/50 bg-white/90 shadow-2xl backdrop-blur-sm',
				className
			)}
		>
			<div className="p-8">
				<h2 className="mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-3xl font-extrabold text-transparent">
					{config.playerNameTitle}
				</h2>
				<form onSubmit={handleSubmit} className="space-y-6">
					<label className="block">
						<input
							type="text"
							placeholder={config.playerNamePlaceholder}
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isLoading}
							autoFocus
							maxLength={50}
							className="w-full rounded-xl border-2 border-gray-300 px-5 py-3 text-lg font-medium shadow-sm transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-400 focus:outline-none"
						/>
					</label>
					<button
						type="submit"
						className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={!name.trim() || isLoading}
					>
						{isLoading ? (
							<>
								<span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-white"></span>
								{config.loading}
							</>
						) : (
							config.playerNameButton
						)}
					</button>
				</form>
			</div>
		</div>
	);
};
