'use client';

import { BoxABI } from '@/common/abis/Box';
import { DaoABI } from '@/common/abis/Dao';
import { BoxAddress, Dao } from '@/common/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { ArrowRight, CheckCircle2, Code2, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Address, encodeFunctionData } from 'viem';
import { useReadContract, useWriteContract } from 'wagmi';

const tasks = [
	{
		title: 'Develop Smart Contract',
		description: 'Create and test the main smart contract',
		status: 'Completed' as const,
		dueDate: '2023-10-01',
		assignee: 'Alice',
	},
	{
		title: 'Frontend Integration',
		description: 'Integrate the smart contract with the frontend',
		status: 'In Progress' as const,
		dueDate: '2023-10-05',
		assignee: 'Bob',
	},
	{
		title: 'Security Audit',
		description: 'Conduct a security audit of the smart contract',
		status: 'Todo' as const,
		dueDate: '2023-10-10',
		assignee: 'Charlie',
	},
	{
		title: 'Documentation',
		description: 'Write comprehensive documentation for the project',
		status: 'Todo' as const,
		dueDate: '2023-10-15',
		assignee: 'Dave',
	},
	{
		title: 'User Testing',
		description: 'Conduct user testing and gather feedback',
		status: 'Todo' as const,
		dueDate: '2023-10-20',
		assignee: 'Eve',
	},
	{
		title: 'Deploy to Testnet',
		description: 'Deploy the smart contract to a testnet for further testing',
		status: 'Todo' as const,
		dueDate: '2023-10-25',
		assignee: 'Frank',
	},
];






export default function Home({ params }: { params: { id: string } }) {
	console.log("🚀 ~ Home ~ id:", params.id)
	const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  console.log("🚀 ~ Home ~ organizations:", organizations)

	// const a = useReadContract({
	// 	abi: BoxABI,
	// 	address: BoxAddress,
	// 	functionName: '',
	// });



  useEffect(() => {
      
      async function fetchProposals() {
        const response = await fetch(`/api/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            
          }
        });
        console.log("🚀 ~ fetchProposals ~ response:", response)
        const data = await response.json();
        setOrganizations(data);
      }
  
      fetchProposals();
  },[])


	const { writeContractAsync } = useWriteContract();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		// Handle form submission logic here
		// const d = {
		//   boxAddress: ["0xe6Eaa8890c58AD9DEd5a419De8E4C07eD7e9eF3F"],
		//   value: [0],
		//   []
		// };

		const data = encodeFunctionData({
			abi: BoxABI,
			functionName: 'store',
			args: [BigInt(77)],
		}) as Address;

		const res = await writeContractAsync({
			address: Dao,
			abi: DaoABI,
			functionName: 'propose',
			args: [
				['0x414789b2377691F53567ec23f9a30d122fA56234'],
				[BigInt(0)],
				[data as Address],
				'abcsbhjmaadsdasdfsdasaasfadsfsdfddf',
			],
		});

		console.log('Proposal submitted');
		setIsOpen(false);
	};
  const Url = `http://w3s.link/ipfs/${organizations?.organizationData?.logo}`;
	return (
		<div className="container mx-auto px-10">
			<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-5 ">
				<div className="md:col-span-2 border-r border-black">
					<Card className="h-full border-none shadow-none">
						<h1 className="text-3xl font-bold mb-4">{organizations?.organizationData?.name}</h1>
						<CardContent className="space-y-4 p-0">
							<div className="flex items-center justify-start ">
								<img
									alt="Company Logo"
									className="h-40 w-40 border rounded-lg border-black"
									src={Url}
								/>
							</div>
							<div className="space-y-2">
								<Label className="font-semibold text-[#000000]">
									Wallet Address
								</Label>
								<p className="text-sm text-muted-foreground break-all">
								{organizations?.organizationData?.walletAddress}
								</p>
							</div>
							<div className="space-y-2">
								<Label className="font-semibold text-[#333333]">
									Contract Address
								</Label>
								<p className="text-sm text-muted-foreground break-all ">
								{organizations?.organizationData?.daocontract}
								</p>
							</div>
							<div className="space-y-2">
								<Label>Description</Label>
								<p className="text-sm text-muted-foreground">
									{organizations?.organizationData?.description}  
								</p>
							</div>
						</CardContent>
					</Card>
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button className="w-[90%] bg-[#ff9632] hover:bg-white hover:text-black border border-black text-black h-12">
								<Send className="w-4 h-4 mr-2" />
								Submit Proposal
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle className="text-xl">Submit Proposal</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2 flex flex-col">
									<Label
										htmlFor="description"
										className="text-[#000000] font-semibold"
									>
										Description
									</Label>
									<Textarea
										id="description"
										placeholder="Enter proposal description"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="other"
										className="text-[#333333] font-semibold"
									>
										Value
									</Label>
									<Input id="other" placeholder="Counter value" />
								</div>
								<Button
									type="submit"
									className="w-full bg-[#ff9632] hover:bg-[#ff9632] text-black border border-black"
								>
									Submit
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<div className="md:col-span-3">
					<div className="space-y-4">
						<h2 className="text-2xl font-bold">Proposals</h2>

						<div className="grid gap-4 md:grid-cols-2">
							{tasks.map((task, index) => (
								<TaskCard key={index} {...task} />
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

interface ProposalCardProps {
	name: string;
	proposalCount: number;
	imageUrl?: string;
	id: number;
}

export function ProposalCard({
	name,
	id,
	proposalCount,
	imageUrl = 'https://kzmjkn9141ba7eq0cqq8.lite.vusercontent.net/placeholder.svg?height=200&width=200',
}: ProposalCardProps) {
	return (
		<Link href={`/proposals/${id}`}>
			<Card className="w-[250px] overflow-hidden border-2">
				<div className="aspect-square w-full relative">
					<img
						src={imageUrl}
						alt={`${name}'s proposal card`}
						className="object-cover w-full h-full"
					/>
				</div>
				<CardContent className="p-4">
					<h3 className="text-2xl font-bold tracking-wide">{name}</h3>
					<p className="text-sm text-muted-foreground">
						{proposalCount} proposals
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}

interface TaskCardProps {
	title: string;
	description: string;
	status: 'Todo' | 'In Progress' | 'Completed';
	dueDate: string;
	assignee: string;
}

export function TaskCard({
	title,
	description,
	status,
	dueDate,
	assignee,
}: TaskCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const statusColor = {
		Todo: 'bg-yellow-500',
		'In Progress': 'bg-blue-500',
		Completed: 'bg-green-500',
	}[status];

	return (
		<>
			<Card
				onClick={() => setIsModalOpen(true)}
				className="w-full max-w-md hover:shadow-lg transition-shadow flex flex-col justify-between border border-black"
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
							<Code2 className="w-4 h-4 text-orange-600" />
						</div>
						<CardTitle className="text-xl font-semibold truncate max-w-56">
							{title}
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 h-full flex flex-col justify-between">
					<div className="flex flex-col gap-4">
						<Badge
							className={`${statusColor} whitespace-nowrap w-fit border border-black mt-2`}
						>
							<CheckCircle2 className="w-3 h-3 mr-1" />
							{status}
						</Badge>
						<CardDescription className="text-[#333333]">
							{description}
						</CardDescription>
					</div>
					<Button variant="outline" className="w-full group border-black ">
						View Details
						<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>
				</CardContent>
			</Card>
			<TaskModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={title}
				description={description}
				status={status}
				dueDate={dueDate}
				assignee={assignee}
			/>
		</>
	);
}

interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description: string;
	status: 'Todo' | 'In Progress' | 'Completed';
	dueDate: string;
	assignee: string;
}

export function TaskModal({
	isOpen,
	onClose,
	title,
	description,
	status,
	dueDate,
	assignee,
}: TaskModalProps) {
	// const statusColor = {
	// 	Todo: 'bg-yellow-500',
	// 	'In Progress': 'bg-blue-500',
	// 	Completed: 'bg-green-500',
	// }[status];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{status}</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<span className="font-medium">Description:</span>
						<p className="col-span-3">{description}</p>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<span className="font-medium">Due Date:</span>
						<span className="col-span-3">{dueDate}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<span className="font-medium">Assignee:</span>
						<span className="col-span-3">{assignee}</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
