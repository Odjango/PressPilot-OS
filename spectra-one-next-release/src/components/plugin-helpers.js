export async function installPlugin( slug ) {
	return new Promise( ( resolve ) => {
		wp.updates.ajax( 'install-plugin', {
			slug,
			success: () => {
				resolve( { success: true } );
			},
			error: ( err ) => {
				resolve( { success: false, code: err.errorCode } );
			},
		} );
	} );
}

export async function activatePluginUrl( url ) {
	try {
		const reqResponse = await fetch( url );

		if ( 200 === reqResponse.status ) {
			return { success: true };
		}
	} catch ( err ) {
		return { success: false };
	}
}
