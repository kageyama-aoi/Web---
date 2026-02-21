function requiredById(id) {
  const el = document.querySelector(`#${id}`);
  if (!el) throw new Error(`Required element not found: #${id}`);
  return el;
}

export function getDomRefs() {
  return {
    editor: requiredById('editor'),
    preview: requiredById('preview'),
    errorBox: requiredById('error'),
    renderBtn: requiredById('renderBtn'),
    autorun: requiredById('autorun'),
    themeSel: requiredById('theme'),
    schemeSel: requiredById('scheme'),
    scaleInput: requiredById('scale'),
    fileInput: requiredById('fileInput'),
    statusEl: requiredById('status'),
    examples: requiredById('examples'),
    loadSampleBtn: requiredById('loadSample'),
    openFileBtn: requiredById('openFile'),
    saveMmdBtn: requiredById('saveMmd'),
    copySvgBtn: requiredById('copySvg'),
    downloadSvgBtn: requiredById('downloadSvg'),
    downloadPngBtn: requiredById('downloadPng'),
    shareUrlBtn: requiredById('shareUrl'),
    selfTestBtn: requiredById('selfTest'),
  };
}
