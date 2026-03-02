const handleProjectFlow = async (chat, message) => {
    const step = chat.projectSetup.step;
  
    switch (step) {
      case 0:
        chat.projectSetup.data.projectName = message;
        chat.projectSetup.step = 1;
        await chat.save();
        return "Which frontend do you want? (React, Next, Flutter etc)";
  
      case 1:
        chat.projectSetup.data.frontend = message;
        chat.projectSetup.step = 2;
        await chat.save();
        return "Which backend?";
  
      case 2:
        chat.projectSetup.data.backend = message;
        chat.projectSetup.step = 3;
        await chat.save();
        return "Which database?";
  
      case 3:
        chat.projectSetup.data.database = message;
        chat.projectSetup.step = 4;
        await chat.save();
        return "Tell main features of your project.";
  
      case 4:
        chat.projectSetup.data.features = message;
        chat.projectSetup.step = 5;
        await chat.save();
  
        // 👉 create project in DB here
        console.log(chat.projectSetup.data);
  
        return "Project created successfully 🚀";
  
      default:
        return "Project setup completed.";
    }
  };