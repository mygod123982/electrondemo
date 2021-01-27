export function getFullscreenElement() {
  return document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null;
}

export function isFullscreen(element) {
  if (getFullscreenElement() && getFullscreenElement() === element) {
    return true;
  }
  return false;
}

export function exitFullscreen() {
  var exitMethod = document.exitFullscreen || //W3C
    document.mozCancelFullScreen || //FireFox
    document.webkitExitFullscreen //Chrome等

  if (exitMethod) {
    exitMethod.call(document);
  }
}

export function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

export function toggleFullscreen(ref = null) {
  const element = ref || document.documentElement;

  if (isFullscreen(element)) {
    exitFullscreen();
    return false;
  } else {
    requestFullscreen(element);
    return true;
  }
}