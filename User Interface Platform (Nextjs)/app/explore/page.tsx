'use client';

import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {

  const [organizations, setOrganizations] = useState([]);
  console.log("🚀 ~ Home ~ organizations:", organizations)

  useEffect(() => {

    async function fetchProposals() {
      const response = await fetch('/api/explore', {
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
  

	const proposals = Array.from({ length: 20 }, (_, index) => ({
		name: `layer ${index + 1}`,
		proposalCount: 91,
		id: index + 1,
	}));

	return (
		<div className='px-10'>
			<div className="mt-5 grid grid-cols-5 gap-4">
				{ organizations.length > 0 && organizations.map((proposal, index) => (
					<ProposalCard
						key={index}
						name={proposal.name}
						proposalCount={proposal.proposalCount}
						id={proposal.id}
            imageUrl={proposal.logo}
					/>
				))}
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
	imageUrl ,
}: ProposalCardProps) {

 const cid = "your-image-cid"; // Replace with your actual CID
  const Url = `http://w3s.link/ipfs/${imageUrl}`;
  
  console.log("🚀 ~ Url:", Url)

	return (
		<Link href={`/proposals/${id}`} className='border-2 border-black rounded-lg'>
			<Card className="w-full  overflow-hidden border-2">
				<div className="aspect-square w-full relative p-2 ">
					<img
						src={Url}
						alt={`${name}'s proposal card`}
						className="object-cover w-full h-full border-2 border-black rounded-lg"
					/>
				</div>
				<CardContent className="px-4 py-3">
					<h3 className="text-2xl font-bold tracking-wide">{name}</h3>
					<p className="text-sm text-[#333333]">
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}
