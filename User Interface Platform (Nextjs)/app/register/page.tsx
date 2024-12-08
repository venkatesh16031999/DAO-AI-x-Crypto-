'use client';

import { DaoRegisterABI } from '@/common/abis/DaoRegister';
import { BoxAddress, DaoRegisterAddress } from '@/common/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, useWriteContract } from 'wagmi';
import { z } from 'zod';

const formSchema = z.object({
	// email: z.string().email('Please enter a valid email address.'),
	name: z.string(),
	description: z.string(),
	ownerWalletAddress: z.string(),
	contractAddress: z.string(),
	logo: z.instanceof(File),
});

const RegisterDao = () => {
	const { writeContractAsync } = useWriteContract();
	const [isLoading, setIsLoading] = useState(false);
	const { address } = useAccount();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: 'arun02580',
			description: 'just a test description',
			ownerWalletAddress: '0x1234',
			contractAddress: '0xC2B1fA74cA31cF4F5E115a888F0e7BFC6067F925',
			// logo: "",
		},
	});
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// const base64image = await fileToBase64(values.logo);
		setIsLoading(true);
		const formData = new FormData();
		formData.append('file', values.logo);

		const uploadrequest = await fetch(
			'https://api.pinata.cloud/pinning/pinFileToIPFS',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
				},
				body: formData,
			}
		);

		const uploadResponse = await uploadrequest.json();
		console.log(uploadResponse);

		// {

		// 	name: values.name,
		// 	description: values.description,
		// 	logo: uploadResponse.IpfsHash,
		// 	ownerWalletAddress: values.ownerWalletAddress,
		// 	contractAddress: values.contractAddress,
		// }
		if (!address) {
			return;
		}
		console.log([
			values.name,
			uploadResponse.IpfsHash,
			address,
			BoxAddress,
			values.description,
		]);
		const res = await writeContractAsync({
			abi: DaoRegisterABI,
			address: DaoRegisterAddress,
			functionName: 'registerDao',
			args: [
				values.name,
				uploadResponse.IpfsHash,
				address,
				BoxAddress,
				values.description,
			],
		});

		// const reciept = await waitForTransactionReceipt(config, { hash: res });
		// console.log(reciept);
		// Authenticate user
		// authenticate({ type: 'email', email: values.email });
		// const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [
		// 	NEW_STORE_VALUE,
		// ]);
		// const NEW_STORE_VALUE = 77;
		// const FUNC = 'store';
		// const proposeTx = await dao.propose(
		// 	[0xe6eaa8890c58ad9ded5a419de8e4c07ed7e9ef3f],
		// 	[0],
		// 	[encodedFunctionCall],
		// 	values.description
		// );
		setIsLoading(false);
	}

	return (
		<div className="flex items-center justify-center h-screen -mt-[80px]">
			<Card className="w-[90%] max-w-3xl pt-4 mx-auto border border-black">
				<CardContent className="h-full ">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="h-full space-y-8"
						>
							<div className="grid grid-cols-2 gap-8">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="john.xyz" {...field} className='bg-zinc-100' />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								
								<FormField
									control={form.control}
									name="logo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Brand Logo</FormLabel>
											<FormControl>
												<Input
													type="file"
													accept="image/*"
													onChange={(e) => field.onChange(e.target.files?.[0])}
													className='bg-zinc-100'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="ownerWalletAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Owner Wallet Address</FormLabel>
											<FormControl>
												<Input placeholder="0x1234" {...field} className='bg-zinc-100'/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="contractAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Contract Address</FormLabel>
											<FormControl>
												<Input placeholder="0x1234" {...field} className='bg-zinc-100' />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								
							</div>
							<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												{/* <Input placeholder="write a description" {...field} /> */}
												<Textarea placeholder="write a description" {...field} className='bg-zinc-100'/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>	
							<Button className="w-full py-6 bg-[#ff9632] text-black border border-black hover:bg-transparent" type="submit">
								{isLoading ? 'Registering...' : "Register"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default RegisterDao;
