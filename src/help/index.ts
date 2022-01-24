import { emoji } from '../utils';
import { get, keys } from 'lodash';
import core from '../utils/core';
import path from 'path';
const { makeUnderLine, publishHelp, getGlobalArgs, getTemplatePath, getYamlContent, loadComponent } = core;

const descption = {
  Options: [
    { '--debug': 'Open debug model.' },
    { '--skip-actions': 'Skip the extends section.' },
    { '-t, --template <path>': 'Specify the template file.' },
    { '-a, --access <aliasName>': 'Specify the access alias name.' },
    { '-v, --version': 'Output the version number.' },
    { '-h, --help': 'Display help for command.' },
  ],
  Commands: [
    { config: '👤  Configure venders account.' },
    { init: '💞  Initializing a serverless project.' },
    { cli: '🐚  Command line operation without yaml mode.' },
    { set: '🔧  Settings for the tool.' },
    { clean: '💥  Clean up the environment.' },
    { component: '🔌  Installed component information.' },
  ],
  Examples: [{ init: 'Perform [s init] fast experience Serverless Devs.' }],
};

async function help(program) {
  const helperLength = publishHelp.maxLen(descption.Options);
  const { template } = getGlobalArgs(process.argv.slice(2));
  let customeDescription = [];
  const spath = await getTemplatePath(template);
  if (spath) {
    const yamlData = await getYamlContent(spath);
    const serviceList = keys(get(yamlData, 'services'));
    if (serviceList.length > 1) {
      for (const service of serviceList) {
        customeDescription.push({
          [`${service} [options]`]: `Please use [s ${service} -h]  obtain the documentation.`,
        });
      }
    } else {
      const component = get(yamlData, ['services', serviceList[0], 'component']);
      const instance = await loadComponent(component);
      const publishPath = path.join(instance.__path, 'publish.yaml');
      const publishContent = await getYamlContent(publishPath);
      const commands = publishContent.Commands;
      if (commands) {
        for (const key in commands) {
          customeDescription.push({ [key]: commands[key] });
        }
      }
    }
  }

  const output = [
    `${emoji('🚀')} Welcome to the Serverless Devs.\n`,
    publishHelp.helpInfo(descption.Options, 'Options', helperLength),
    publishHelp.helpInfo(descption.Commands, 'Commands', helperLength),
    publishHelp.helpInfo(customeDescription, 'Custom Commands', helperLength),
    publishHelp.helpInfo(descption.Examples, 'Examples', helperLength),
    `${emoji('🧭')} ${makeUnderLine('More information: https://github.com/Serverless-Devs/Serverless-Devs')} ` + '\n',
  ].join('\n');

  program.on('--help', () => {
    console.log(output);
  });
  return output;
}

export default help;