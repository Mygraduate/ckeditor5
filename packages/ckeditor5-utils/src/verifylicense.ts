/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/verifylicense
 */

import { releaseDate } from './version';

/**
 * Possible states of the key after verification.
 */
export type VerifiedKeyStatus = 'VALID' | 'INVALID';

/**
 * Checks whether the given string contains information that allows you to verify the license status.
 *
 * @param token The string to check.
 * @returns String that represents the state of given `token` parameter.
 */
export default function verifyLicense( token: string | undefined ): VerifiedKeyStatus {
	function oldTokenCheck( token: string ): VerifiedKeyStatus {
		if ( token.match( /^[a-zA-Z0-9+/=$]+$/g ) && ( token.length >= 40 && token.length <= 255 ) ) {
			return 'VALID';
		} else {
			return 'INVALID';
		}
	}

	// TODO: issue ci#3175
	let decryptedData = '';
	let decryptedSecondElement = '';

	if ( !token ) {
		return 'INVALID';
	}

	try {
		decryptedData = atob( token );
	} catch ( e ) {
		return 'INVALID';
	}

	const splittedDecryptedData = decryptedData.split( '-' );

	const firstElement = splittedDecryptedData[ 0 ];
	const secondElement = splittedDecryptedData[ 1 ];

	if ( !secondElement ) {
		return oldTokenCheck( token );
	}

	try {
		atob( secondElement );
	} catch ( e ) {
		try {
			atob( firstElement );

			if ( !atob( firstElement ).length ) {
				return oldTokenCheck( token );
			}
		} catch ( e ) {
			return oldTokenCheck( token );
		}
	}

	if ( firstElement.length < 40 || firstElement.length > 255 ) {
		return 'INVALID';
	}

	try {
		// Must be a valid format.
		atob( firstElement );
	} catch ( e ) {
		return 'INVALID';
	}

	try {
		decryptedSecondElement = atob( secondElement );
	} catch ( e ) {
		return 'INVALID';
	}

	if ( decryptedSecondElement.length !== 8 ) {
		return 'INVALID';
	}

	const year = Number( decryptedSecondElement.substring( 0, 4 ) );
	const monthIndex = Number( decryptedSecondElement.substring( 4, 6 ) ) - 1;
	const day = Number( decryptedSecondElement.substring( 6, 8 ) );

	const date = new Date( year, monthIndex, day );

	if ( date < releaseDate || isNaN( Number( date ) ) ) {
		return 'INVALID';
	}

	return 'VALID';
}
