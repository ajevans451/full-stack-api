# DnD Character Creation API
An API used in combination with the front-end Dungeons and Dragons Character Maker client to allow users to log in and create their own DnD character resources.

### Planning Story
I planned to set up the user model and schema and that character model and schema during the first day of work on this project, and add the cURL scripts for the user and resources. THe second day was planned to be the day when I created the routers for the user and resource. After that was finished, I planned to move the work over to the front-end. Despite my best efforts, the development of the back-end dragged on, between node compiling errors and having to reinstall a multitude of npm packages and many time-consuming errors, the back-end remained unfinished after two days. During this time, whenever I hit a roadblock that I just couldn't find a fix for, I'd move to my front-end so that it wasn't just a blank webpage in the end. Due to this stategy, after the two days, I had a significant amount of work done for my front-end so instead of switching focus to it, I continued to prioritize the back-end for the remaining two days. After the thired day of work, the sign-in/up/out and change password actions were working on local host and communicating with the front-end. On the fourth day of work, I deployed both the front and back end to test the functionality of the CRUD actions and communication between the deployments. This presented its own errors, and I spent the majoyity of the fourth day tackling those.

### Important Links
- [Deployed Client](https://ajevans451.github.io/full-stack-client/)
- [Deployed API](https://dnd-character-creation.herokuapp.com/)
- [Other Repo](https://github.com/ajevans451/full-stack-client)

#### Technologies Used
- Javascript
- Express
- Mongodb

#### Unsolved Problems
- I would like to re-implement the option to select a single character to show with the character's ID.

#### Entity Relationship Diagram
![Entity Relationship Diagram](https://media.git.generalassemb.ly/user/31380/files/62098880-1d3b-11eb-9b26-2a5056fdd0d6)
