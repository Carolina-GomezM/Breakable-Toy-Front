import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react'
import '@testing-library/jest-dom'
/* import fetchMock from 'jest-fetch-mock'
 */
/* fetchMock.enableMocks();
 */

afterEach(() => {
    cleanup();
/*     fetchMock.resetMocks(); */
})