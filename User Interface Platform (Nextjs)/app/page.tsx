'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useRouter } from "next/router";

export default function Home() {

	// const router = useRouter()
	return (
		<div className="fixed top-0 border mx-auto w-full flex flex-col justify-center items-center h-screen bg-[#faf8f5]">
			<div className="flex flex-col gap-3 justify-center items-center">
			<h1 className="text-5xl font-bold ">
				Smarter. Faster. Fully Automated.</h1>
				<h1 className="text-5xl font-bold ">Revolutionizing DAO  with Ai Agents</h1>
			</div>
			
			<img  src="/group3.svg" className="w-40 absolute -left-12 bottom-10" />
			<img  src="/group4.svg" className="w-40 absolute -right-12 top-10" />

			<div className="flex gap-6 py-10" >
				<Link href={'/explore'}>
				<Button className="w-40 h-12 bg-[#ff9632] border border-black text-black hover:bg-transparent hover:text-black " >Explore</Button>
				</Link>
				<Link href={'/register'}>
				<Button className="w-40 h-12 bg-transparent border border-black text-black hover:text-white ">OnBoard</Button>
				</Link>
			</div>
		</div>
	)
}
