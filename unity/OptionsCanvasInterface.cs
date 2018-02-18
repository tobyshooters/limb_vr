using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;
using UnityEngine;

public class OptionsCanvasInterface : MonoBehaviour {
	public Canvas MainCanvas;
	public Canvas OptionsCanvas;
	public Canvas ChooseDemoCanvas;

	void Awake(){
		OptionsCanvas.enabled = false;
		ChooseDemoCanvas.enabled = false; 
	}

	void Update ()
	{
		OVRInput.Update(); // need to be called for checks below to work

		// MAP SOUND ON/OFF IF WE HAVE TIMEEEEEEEEEEEEEEEEEEEEEEEEEEE

		if (OVRInput.Get(OVRInput.Button.Two)) {
			OptionsCanvas.enabled = false;
			MainCanvas.enabled = true;
			ChooseDemoCanvas.enabled = false; 
		}
	}
}
