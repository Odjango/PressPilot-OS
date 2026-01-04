import { PanelRow, ToggleControl } from '@wordpress/components';
import React, { useCallback } from 'react';
import { dispatch } from '@wordpress/data';

export const SwtRadioButton = ( { setting, setSetting, id, setData, notice, label } ) => {
	const handleOnChange = useCallback( () => {
		setSetting( { ...setting, [ id ]: ! setting[ id ] } );
		setData( { ...setting, [ id ]: ! setting[ id ] } );

		dispatch( 'core/notices' ).createNotice(
			'success', // Can be one of: success, info, warning, error.
			notice, // Text string to display.
			{
				type: 'snackbar',
				isDismissible: true, // Whether the user can dismiss the notice.
			}
		);
	  }, [ setting ] );

	return (
		<>
			<PanelRow>
				<ToggleControl
					label={ label }
					checked={ setting[ id ] }
					onChange={ handleOnChange }
				/>
			</PanelRow>
		</>
	);
};
