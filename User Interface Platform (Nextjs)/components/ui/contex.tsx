// context/index.tsx
'use client';

import { baseSepolia, mainnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { projectId, wagmiAdapter } from './wagmi';

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
	throw new Error('Project ID is not defined');
}

// Set up metadata
const metadata = {
	name: 'super',
	description: 'AppKit Example',
	url: 'https://reown.com/appkit', // origin must match your domain & subdomain
	icons: ['https://assets.reown.com/reown-profile-pic.png'],
};

// Create the modal
createAppKit({
	adapters: [wagmiAdapter],
	projectId,
	networks: [mainnet, baseSepolia],
	defaultNetwork: mainnet,
	metadata: metadata,
	features: {
		analytics: true, // Optional - defaults to your Cloud configuration
	},
});

function ContextProvider({
	children,
	cookies,
}: {
	children: ReactNode;
	cookies: string | null;
}) {
	const initialState = cookieToInitialState(
		wagmiAdapter.wagmiConfig as Config,
		cookies
	);

	return (
		<WagmiProvider
			config={wagmiAdapter.wagmiConfig as Config}
			initialState={initialState}
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}

export default ContextProvider;
