/**
 * Meta Options build.
 */
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import SwtIcons from '../../components/icons.js';
import { SwtComponents } from './components.js';

const SwtSidebar = ( props ) => {
	return (
		<>
			{ /* Page Settings Icon. */ }
			<PluginSidebarMoreMenuItem
				target="swt-page-settings-panel"
				icon={ SwtIcons.logo }
			>
				{ __( 'Spectra Page Settings', 'spectra-one' ) }
			</PluginSidebarMoreMenuItem>

			{ /* Page Settings Area. */ }
			<PluginSidebar
				isPinnable={ true }
				icon={ SwtIcons.logo }
				name="swt-page-settings-panel"
				title={ __( 'Spectra Page Settings', 'spectra-one' ) }
				className={ 'swt-sidebar' }
			>
				<SwtComponents { ...props } />
			</PluginSidebar>
		</>
	);
};

export default compose(
	withSelect( ( select ) => {
		const postMeta = select( 'core/editor' ).getEditedPostAttribute( 'meta' );
		const oldPostMeta =
			select( 'core/editor' ).getCurrentPostAttribute( 'meta' );
		return {
			meta: { ...oldPostMeta, ...postMeta },
			oldMeta: oldPostMeta,
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		setMetaFieldValue: ( value, field ) =>
			dispatch( 'core/editor' ).editPost( {
				meta: { [ field ]: value },
			} ),
	} ) )
)( SwtSidebar );
