import { describe, expect, test } from '@jest/globals';
import { EventMonkeyDataSource } from '../helpers/Database.js';
import { Image } from '../models/Image.js';
import { Attendee } from '../models/User.js';
import { Organizer } from '../models/User.js';

// Setting up a fake users to be used in tests
const tempPFP = new Image(24680, '1:1', 1000, 1000, 'test_fake_pfp_img.png');

const userA1 = new Attendee(12345, 'testemailAttendee@mail.com', 'P@ssW0rd1',
    'AttendeeUser', tempPFP, [])
const userO1 = new Organizer(28532, 'testemailOrganizer@mail.com', 'P@ssW0rd2',
    'OrganizerUser', tempPFP, [])

describe('Testing DataSource Class Functions', () => {
    const toyDataSource = new EventMonkeyDataSource;
    /**
     * This is to test that an attendee user has been successfully added into
     * the data source. Since this function returns an insertId, we would know
     * that an error happened if the function is null. So we use the .not part
     * to check that the return value is not null, and is something, insertId.
     * Expected return: insertId
     */
    test('Testing addUserDetails: adding attendee into data source', () => {
        expect(toyDataSource.addUserDetails(userA1))
            .not.toStrictEqual(null);
    });
    /**
     * This is an extension to the previous test, this is to test adding an
     * organizer to the data source.
     * Expected return: insertId
     */
    test('Testing addUserDetails: adding organizer into data source', () => {
        expect(toyDataSource.addUserDetails(userO1))
            .not.toStrictEqual(null);
    });
    /**
     * This tests that the function can correctly check if a user was correctly,
     * and successfully, added into the data source. One way we check that is by
     * testing that the email already exists. Since if it exists, the function
     * would not return true, so we use the .not to state that it would be not
     * true. This also is a secondary test to the previous one as the email
     * given is the one from userA1.
     * Expected return: result[0]['count'] === 0n
     */
    test('Testing isEmailUnique: email that does already exist', () => {
        expect(toyDataSource.isEmailUnique('testemailAttendee@mail.com'))
            .not.toStrictEqual(true);
    });
    /**
     * This is to test that the isEmailUnique works as intended. This test is
     * given an email that does not exist inside of the toy data source. So, the
     * function should return true this time as the email would be completely
     * unique to the emails that are already present inside of the data source.
     * Expected return: true
     */
    test('Testing isEmailUnique: email that does not exist yet', () => {
        expect(toyDataSource.isEmailUnique('testUniqueEmail@mail.com'))
            .toStrictEqual(true);
    });
    /**
     * This is to check that we can successfully get the login details of a
     * specific user given their email. The function returns a dictionary of the
     * user's email, password and username.
     * Expected return: {
     *                      email: 'testemailAttendee@mail.com',
     *                      password: 'P@ssW0rd1',
     *                      username: 'AttendeeUser'
     *                  }
     */
    test('Testing getLoginDetails: given a valid email', () => {
        let attendeeDetails = {
            email: 'testemailAttendee@mail.com',
            password: 'P@ssW0rd1',
            username: 'AttendeeUser'
        }
        expect(toyDataSource.getLoginDetails('testemailAttendee@mail.com'))
            .toStrictEqual(addUserDetails);
    });
    /**
     * This is an extension to the above test, where we check that the function
     * would not return anything if we give it an invalid email. If we did get
     * something, besides undefined, it would be a major problem as then we
     * would be able to get login details without valid emails.
     * Expected return: undefined
     */
    test('Testing getLoginDetails: given an invalid email', () => {
        expect(toyDataSource.getLoginDetails('unknownUserEmail@mail.com'))
            .toStrictEqual(undefined);
    });
});

/**
 * test('Testing name', () => {
 *     expect(1)
 *         .toStrictEqual(1);
 * });
 */
