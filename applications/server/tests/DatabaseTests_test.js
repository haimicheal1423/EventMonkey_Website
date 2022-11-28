//import { describe, expect, test } from '@jest/globals';
//import { EventMonkeyDataSource } from '../helpers/Database.js';
//import { Image } from '../models/Image.js';
//import { Attendee } from '../models/User.js';
//import { Organizer } from '../models/User.js';
//
//beforeAll(async() => {
//    await Database.initPool({
//        host: 'localhost',
//        user: 'dev',
//        password: 'csc648',
//        database: 'test'
//    });
//
//    // clear all tables before all the tests
//    await Database.query('DELETE FROM User');
//    await Database.query('DELETE FROM Event');
//    await Database.query('DELETE FROM Genre');
//    await Database.query('DELETE FROM Image');
//    await Database.query('DELETE FROM Event_Genre_List');
//    await Database.query('DELETE FROM Event_Image_List');
//    await Database.query('DELETE FROM User_EM_Event_List');
//    await Database.query('DELETE FROM User_TM_Event_List');
//    await Database.query('DELETE FROM Attendee_Friend_List');
//    await Database.query('DELETE FROM Attendee_Interest_List');
//});
//
//// Setting up a fake users to be used in tests
//const tempPFP = new Image(24680, '1:1', 1000, 1000, 'test_fake_pfp_img.png');
//
//const userA1 = new Attendee(12345, 'testemailAttendee@mail.com', 'P@ssW0rd1',
//    'AttendeeUser', tempPFP, [])
//const userO1 = new Organizer(28532, 'testemailOrganizer@mail.com', 'P@ssW0rd2',
//    'OrganizerUser', tempPFP, [])
//
//describe('Testing DataSource Class Functions', () => {
//    const toyDataSource = new EventMonkeyDataSource;
//    /**
//     * This is to test that an attendee user has been successfully added into
//     * the data source. Since this function returns an insertId, we would know
//     * that an error happened if the function is null. So we use the .not part
//     * to check that the return value is not null, and is something, insertId.
//     * Expected return: insertId
//     */
//    it('Testing addUserDetails: adding attendee into data source', async() = > {
//        expect(toyDataSource.addUserDetails(userA1))
//            .not.toStrictEqual(null);
//    });
//    /**
//     * This is an extension to the previous test, this is to test adding an
//     * organizer to the data source.
//     * Expected return: insertId
//     */
//    it('Testing addUserDetails: adding organizer into datasource', async() = > {
//        expect(toyDataSource.addUserDetails(userO1))
//            .not.toStrictEqual(null);
//    });
//    /**
//     * This tests that the function can correctly check if a user was correctly,
//     * and successfully, added into the data source. One way we check that is by
//     * testing that the email already exists. Since if it exists, the function
//     * would not return true, so we use the .not to state that it would be not
//     * true. This also is a secondary test to the previous one as the email
//     * given is the one from userA1.
//     * Expected return: result[0]['count'] === 0n
//     */
//    it('Testing isEmailUnique: email that does already exist', async() = > {
//        expect(toyDataSource.isEmailUnique('testemailAttendee@mail.com'))
//            .not.toStrictEqual(true);
//    });
//    /**
//     * This is to test that the isEmailUnique works as intended. This test is
//     * given an email that does not exist inside of the toy data source. So, the
//     * function should return true this time as the email would be completely
//     * unique to the emails that are already present inside of the data source.
//     * Expected return: true
//     */
//    it('Testing isEmailUnique: email that does not exist yet', async() = > {
//        expect(toyDataSource.isEmailUnique('testUniqueEmail@mail.com'))
//            .toStrictEqual(true);
//    });
//    /**
//     * This is to check that we can successfully get the login details of a
//     * specific user given their email. The function returns a dictionary of the
//     * user's email, password and username.
//     * Expected return: {
//     *                      email: 'testemailAttendee@mail.com',
//     *                      password: 'P@ssW0rd1',
//     *                      username: 'AttendeeUser'
//     *                  }
//     */
//    it('Testing getLoginDetails: given a valid email', async() = > {
//        let attendeeDetails = {
//            email: 'testemailAttendee@mail.com',
//            password: 'P@ssW0rd1',
//            username: 'AttendeeUser'
//        }
//        expect(toyDataSource.getLoginDetails('testemailAttendee@mail.com'))
//            .toStrictEqual(addUserDetails);
//    });
//    /**
//     * This is an extension to the above test, where we check that the function
//     * would not return anything if we give it an invalid email. If we did get
//     * something, besides undefined, it would be a major problem as then we
//     * would be able to get login details without valid emails.
//     * Expected return: undefined
//     */
//    it('Testing getLoginDetails: given an invalid email', async() = > {
//        expect(toyDataSource.getLoginDetails('unknownUserEmail@mail.com'))
//            .not.toBeDefined();
//    });
//    /**
//     * This function gets the user Id of a valid user, when given the user's
//     * username. In this test, we give it a valid user AttendeeUser and check to
//     * make sure that the AttendeeUser's ID was successfully returned by the
//     * function.
//     * Expected return: 12345
//     */
//    it('Testing getUserId: given a valid username', async() = > {
//        expect(toyDataSource.getUserId('AttendeeUser'))
//            .toStrictEqual(12345);
//    });
//    /**
//     * This is to make sure that the getUserId would not return any users' IDs
//     * when we give it an invalid username. This is to make sure that the
//     * function would not return a user ID if the user does not exist in the
//     * database.
//     * Expected return: undefined
//     */
//    it('Testing getUserId: given an invalid username', async() = > {
//        expect(toyDataSource.getUserId('FakeUsername'))
//            .not.toBeDefined();
//    });
//    /**
//     * This is to test the function of addToFriends. It takes in the user ID and
//     * the friend's ID. This should return the amount of rows that have been
//     * edited because adding the friend to the list. So, we will test that this
//     * function does work by stating that the return true. This is because we
//     * return a boolean based on if there were rows edited by this function.
//     * Expected return: true
//     */
//    it('Testing addToFriends: Given two valid user ID', async() = > {
//        expect(toyDataSource.addToFriends(12345, 28532))
//            .toBe(true);
//    });
//    /**
//     * This is an extension of the above test. This is to ensure that if we give
//     * an invalid ID, there should be no rows affected if we give an invalid
//     * friend ID. Since, no rows should have been edited, it would return false.
//     * Expected return: false
//     */
//    it('Testing addToFriends: Given an invalid friend ID', async() = > {
//        expect(toyDataSource.addToFriends(12345, 64563))
//            .toBe(false);
//    });
//    /**
//     * This should also return false since we test adding a friend to an invalid
//     * user. This should not affect any rows in our database, so the affected
//     * rows would be 0 -> false.
//     * Expected return: false
//     */
//    it('Testing addToFriends: Given an invalid user ID', async() = > {
//        expect(toyDataSource.addToFriends(23525, 64563))
//            .toBe(false);
//    });
//    /**
//     * This tests that removing a friend from a user's friends list works as
//     * intended. This function will return true if there were rows in the
//     * database that got modified from this function. The
//     */
//    it('Testing removeFromFriends: Given two valid user ID', async() = > {
//        expect(toyDataSource.removeFromFriends(12345, 28532))
//            .not.toBe(true);
//    });
//    /**
//     *
//     */
//    it('Testing removeFromFriends: Given an invalid friend ID', async() = > {
//        expect(toyDataSource.removeFromFriends(12345, 64563))
//            .not.toBe(false);
//    });
//    /**
//     *
//     */
//    it('Testing removeFromFriends: Given an invalid user ID', async() = > {
//        expect(toyDataSource.removeFromFriends(23525, 64563))
//            .not.toBe(false);
//    });
//    /**
//     * This should return the eventList of the user when given a valid user ID.
//     * In this test, the return is an empty array since when the test user was
//     * created, they were initialized with an empty event list.
//     * Expected return: []
//     */
//    it('Testing getEventMonkeyList: Given a user ID', async() = > {
//        expect(toyDataSource.getEventMonkeyList(12345))
//            .not.toStrictEqual([]);
//    });
//    /**
//     * This should behave similarly to the function test before as this is given
//     * a valid user ID, it would return their event list, which now is from
//     * ticket master. This should also return an empty array as nothing was
//     * initialized for them.
//     * Expected return: []
//     */
//    it('Testing getTicketMasterList: Given a user ID', async() = > {
//        expect(toyDataSource.getTicketMasterList(12345))
//            .not.toStrictEqual([]);
//    });
//});
//
//afterAll(async() => {
//    await Database.shutdown();
//});
