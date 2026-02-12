# Description
In preparation for implementing further role behavior and permissions, I need to way to easily invite new users. For now since it's just me, 
I would like to be able to add a user in the format someemail+alias@outlook.com.

In other words, if I already have a user with the email shorn813@outlook.com, I should be able to invite/create a new user with the email shorn813+nonadmin@outlook.com and
the confirmation email be sent to shorn813@outlook.com, but treated as a new user in the app.

The intent is to easily create new users without needing a new email every time for testing purposes.
If there are better ways of doing this please make the suggestion.

# Ideal UX (I think? I'm open to suggestions)
- The original user of shorn813@outlook.com invites shorn813+member@outlook.com
- original user accepts email invite link
- original user is logged out
- new user gets redirected to the set password page and logs in afterwards