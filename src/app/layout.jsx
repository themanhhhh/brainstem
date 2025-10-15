import React, { Suspense } from 'react';
import Navbar from './ui/dashboard/navbar/navbar';
import Sidebar from './ui/dashboard/sidebar/sidebar';
import ClientProviders from './components/ClientProviders';
import Loading from './loading';

import Style from "./styles/dashboard.module.css";
import "./styles/globals.css";

const RootLayout = ({children}) => {
	return (
		<html lang="en">
			<body>
				<ClientProviders>
					<div className={Style.container}>
						<div className={Style.menu}>
							<Sidebar />
						</div>
						<div className={Style.content}>
							<Navbar />
							<Suspense fallback={<Loading />}>
								{children}
							</Suspense>
						</div>
					</div>
				</ClientProviders>
			</body>
		</html>
	)
}

export default RootLayout