import { useState } from 'react';
import { Button, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { activatePluginUrl, installPlugin } from './plugin-helpers.js';

const SwtPluginInstallNotice = () => {
	const { activationUrl, pluginSlug, pluginStatus } = spectraOne;

	// Initializing empty object to store text
	let currentTextObject = [];

	// Text object if plugin is only installed and not activated
	if ( pluginStatus !== 'activated' && pluginStatus === 'installed' ) {
		currentTextObject = {
			initialText: 'Activate Spectra',
			progressText: 'Activating Spectra...',
			errorText: 'Error activating Spectra',
			SuccessText: 'Spectra Activated',
		};
	}

	// Text object if plugin is not installed
	if ( pluginStatus !== 'installed' && pluginStatus !== 'activated' ) {
		currentTextObject = {
			initialText: 'Install & Activate Spectra',
			progressText: 'Installing & Activating Spectra...',
			errorText: 'Error installing Spectra',
			SuccessText: 'Spectra Installed & Activated',
		};
	}

	// Destructuring set object to access variables directly
	const { initialText, progressText, errorText, SuccessText } =
		currentTextObject;

	// Sets button state to change button behaviour accordingly
	const [ buttonState, setButtonState ] = useState( false );

	// Sets button inner text
	const [ buttonText, setButtonText ] = useState( initialText );

	// Sets button state disable or re-enable button
	const [ disableButton, setDisableButton ] = useState( false );

	// Function to activate plugin
	const activatePlugin = async ( pluginInitSlug ) => {
		// Setting up post request to activate plugin
		const reqResponse = await activatePluginUrl( pluginInitSlug );

		if ( true === reqResponse.success ) {
			// Shows the users that the plugin is successfully installed and reloads the page
			setButtonState( false );
			setButtonText( SuccessText );
			location.reload();
		} else {
			// Shows the user that there an error has occured
			setButtonText( errorText );
			setButtonState( false );

			// Resets state so that the user can retry again
			setTimeout( () => {
				setButtonText( SuccessText );
				setButtonState( false );
				setDisableButton( false );
			}, 2000 );
		}
	};

	// Handles on click to install set plugin
	const handleSubmit = async ( slug, pluginInit ) => {
		// Checks if button disabled so that the button can be only clicked once
		if ( false === disableButton ) {
			// Sets all required useStates
			setButtonText( progressText );
			setButtonState( true );
			setDisableButton( true );

			// Checks if plugin is only installed and not activated
			if ( pluginStatus !== 'activated' && pluginStatus === 'installed' ) {
				// Activates the set plugin
				activatePlugin( pluginInit );
			} else {
				try {
					// Gets the plugin files if not downloaded
					await installPlugin( slug );

					// Activates the set plugin
					activatePlugin( pluginInit );
				} catch ( e ) {
					// If the plugin is already downloaded then this check that and activates the set plugin
					if ( 'folder_exists' === e.errorCode ) {
						// Activates the set plugin
						activatePlugin( pluginInit );
					}
				}
			}
		}
	};

	return (
		<PanelBody
			title={ __( 'Spectra plugin', 'spectra-one' ) }
			initialOpen={ true }
		>
			<p>
				{ __(
					'Power-up your website with advanced and powerful blocks that help you build websites in no time!',
					'spectra-one'
				) }
			</p>
			<Button
				className={ `swt-full-width-btn ${
					true === buttonState ? 'is-busy ' : ''
				} ` }
				onClick={ () => handleSubmit( pluginSlug, activationUrl ) }
				isPrimary={ true }
				aria-disabled={ disableButton }
			>
				{ buttonText }
			</Button>
		</PanelBody>
	);
};

export default SwtPluginInstallNotice;
