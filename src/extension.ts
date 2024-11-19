import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Accessibility Checker is now active.');

    let disposable = vscode.commands.registerCommand('extension.checkAccessibility', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showInformationMessage('No active editor found!');
            return;
        }

        const code = editor.document.getText();
        const violations = checkAccessibility(code);

        if (violations.length === 0) {
            vscode.window.showInformationMessage('No accessibility issues found!');
        } else {
            const outputChannel = vscode.window.createOutputChannel('Accessibility Checker');
            outputChannel.show();
            outputChannel.appendLine('Accessibility issues detected:');

            violations.forEach(violation => {
                outputChannel.appendLine(`Issue: ${violation.issue}`);
                outputChannel.appendLine(`Line: ${violation.line}`);
                outputChannel.appendLine(`Code: ${violation.code}`);
                outputChannel.appendLine('');
            });
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * Função de verificação de acessibilidade.
 * Aqui, estamos apenas verificando imagens sem atributo alt,
 * links sem texto significativo e botões sem descrição.
 */
function checkAccessibility(code: string): Array<{ issue: string, line: number, code: string }> {
    const violations: Array<{ issue: string, line: number, code: string }> = [];
    const lines = code.split('\n');

    // Verificar imagens sem o atributo "alt"
    lines.forEach((line, index) => {
        const imgTagRegex = /<img[^>]*>/g;
        const matches = line.match(imgTagRegex);

        if (matches) {
            matches.forEach(imgTag => {
                if (!/<img[^>]*alt\s*=\s*['"][^'"]*['"]/i.test(imgTag)) {
                    violations.push({
                        issue: 'Image tag missing alt attribute',
                        line: index + 1,  // As linhas são 1-indexadas
                        code: line.trim()
                    });
                }
            });
        }
    });

    // Verificar links sem texto significativo
    lines.forEach((line, index) => {
        const linkTagRegex = /<a[^>]*>/g;
        const matches = line.match(linkTagRegex);

        if (matches) {
            matches.forEach(linkTag => {
                const linkText = linkTag.replace(/<a[^>]*>/g, '').replace(/<\/a>/g, '').trim();
                if (!linkText || linkText === '') {
                    violations.push({
                        issue: 'Link without meaningful text',
                        line: index + 1,
                        code: line.trim()
                    });
                }
            });
        }
    });

    // Verificar botões sem texto descritivo
    lines.forEach((line, index) => {
        const buttonTagRegex = /<button[^>]*>/g;
        const matches = line.match(buttonTagRegex);

        if (matches) {
            matches.forEach(buttonTag => {
                const buttonText = buttonTag.replace(/<button[^>]*>/g, '').replace(/<\/button>/g, '').trim();
                if (!buttonText || buttonText === '') {
                    violations.push({
                        issue: 'Button without descriptive text',
                        line: index + 1,
                        code: line.trim()
                    });
                }
            });
        }
    });

    return violations;
}

export function deactivate() {
    console.log('Accessibility Checker is now deactivated.');
}
