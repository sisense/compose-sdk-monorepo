import inquirer from 'inquirer';
import { ArgumentsCamelCase } from 'yargs';

export const promptPasswordInteractive = (username: string) =>
  inquirer.prompt<ArgumentsCamelCase<{ maskedPassword: string }>>([
    {
      type: 'password',
      name: 'maskedPassword',
      mask: '*',
      message: `Enter password for username '${username}':`,
      validate: (answer: string) => {
        if (!answer || answer === '') {
          return 'Password cannot be blank';
        }
        return true;
      },
    },
  ]);
