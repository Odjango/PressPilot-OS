import {
	activatePluginUrl,
	installPlugin,
} from '../components/plugin-helpers.js';

document.addEventListener( 'DOMContentLoaded', () => {
	handleWelcomeNotice();
} );

function handleWelcomeNotice() {
	const {
		activating,
		installing,
		done,
		activationUrl,
		ajaxUrl,
		pluginSlug,
		nonce,
		pluginStatus,
	} = spectraOne;

	let installStatusText;
	const CloseButton = document.querySelector(
		'.swt-welcome-notice .notice-dismiss'
	);
	const WelcomeNoticeContainer = document.querySelector(
		'.swt-welcome-notice'
	);
	const InstallButton = document.querySelector(
		'.swt-welcome-notice #swt-install-spectra'
	);
	if ( InstallButton ) {
		installStatusText = InstallButton.querySelector( '.text' );
	}

	const hideAndRemoveNotice = () => {
		if ( WelcomeNoticeContainer ) {
			WelcomeNoticeContainer.remove();
		}
	};

	const activateSpectra = async () => {
		installStatusText.textContent = activating;
		await activatePluginUrl( activationUrl );

		InstallButton.classList.remove( 'updating-message' );
		InstallButton.classList.add( 'updated-message' );

		installStatusText.textContent = done;
		setTimeout( hideAndRemoveNotice, 2000 );
	};

	if ( InstallButton ) {
		InstallButton.addEventListener( 'click', async () => {
			InstallButton.classList.add( 'updating-message' );
			InstallButton.classList.add( 'disabled' );

			if ( pluginStatus === 'installed' ) {
				await activateSpectra();
				return;
			}

			installStatusText.textContent = installing;
			await installPlugin( pluginSlug );
			await activateSpectra();
		} );
	}

	CloseButton.addEventListener( 'click', async () => {
		const res = {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: `action=swt_dismiss_welcome_notice&nonce=${ nonce }`,
		};

		try {
			const reqResponse = await fetch( ajaxUrl, res );

			if ( 200 === reqResponse.status ) {
				hideAndRemoveNotice();
			}
		} catch ( err ) {}
	} );
}
