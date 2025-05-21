export const rootId = 'preact';
export const rootContentId = 'preactContent';
export const template = `
    <div #${rootId} class="csdk-full-size-container"></div>
`;
export const templateWithContent = `
    <div #${rootId} class="csdk-full-size-container">
        <div #${rootContentId} class="csdk-full-size-container">
            <ng-content></ng-content>
        </div>
    </div>
`;
export const styles = [
  `.csdk-full-size-container {
        width: 100%;
        height: 100%;
    }`,
];
