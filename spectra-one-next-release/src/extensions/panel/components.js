import { PanelBody, PanelRow, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { HeaderSettings } from '../../block-extensions/header';
import SwtPluginInstallNotice from '../../components/install-plugin-notice.js';

export const SwtComponents = ( props ) => {
	const disableSections = Object.entries( spectraOne.disable_sections ).map(
		( [ key, value ] ) => {
			const sectionValue =
				props?.meta[ value.key ] && props.meta[ value.key ] ? true : false;
			return (
				<PanelRow key={ key }>
					<ToggleControl
						key={ key }
						label={ value.label }
						checked={ sectionValue }
						onChange={ ( val ) => {
							props.setMetaFieldValue( val, value.key );
						} }
					/>
				</PanelRow>
			);
		}
	);

	const panelBody = (
		<>
			<PanelBody
				title={ __( 'Disable Elements', 'spectra-one' ) }
				initialOpen={ true }
				className={ 'swt-disable-elements-panel' }
			>
				{ disableSections }
			</PanelBody>

			{ ! props?.meta?._swt_meta_header_display && (
				<PanelBody
					title={ __( 'Header Settings', 'spectra-one' ) }
					initialOpen={ true }
					className={ 'swt-header-settings-panel' }
				>
					<HeaderSettings
						{ ...props }
						{ ...spectraOne.header_settings }
					/>
				</PanelBody>
			) }

			{ spectraOne.pluginStatus !== 'activated' && (
				<SwtPluginInstallNotice { ...props } />
			) }
		</>
	);

	return panelBody;
};
