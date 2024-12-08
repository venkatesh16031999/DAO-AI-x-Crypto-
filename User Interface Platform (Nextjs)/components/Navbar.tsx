'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
	const { open } = useAppKit();
	const { address } = useAccount();
	return (
		<div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur py-5 px-10 bg-black ">
			<div className="flex justify-between items-center container mx-auto">
				<div>
					<div className="mr-4 flex">
						<Link href="/" className="mr-6 flex items-center space-x-2">
							<img src="/FlashDAO.svg" alt="asfasfd" className="w-48 " />
						</Link>
					</div>
				</div>
				<div>
					<div className="flex flex-1 items-center justify-center"></div>
				</div>
				<div onClick={() => open()}>
					<div className="flex flex-1 items-center justify-end space-x-2 bg-[#ff9632] rounded-lg">
						{address ? (
							<Button
								variant="outline"
								className="hidden sm:flex bg-[#ff9632] border-none  rounded-lg"
							>
								<Wallet className="mr-2 h-4 w-4" />
								{address.slice(0, 6)}...{address.slice(-4)}
							</Button>
						) : (
							<div>
								<Button
									variant="outline"
									className="hidden sm:flex bg-[#ff9632] border-none  rounded-lg"
								>
									<Wallet className="mr-2 h-4 w-4" />
									Connect Wallet
								</Button>
								<Button className="sm:hidden" variant="outline" size="icon">
									<Wallet className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
