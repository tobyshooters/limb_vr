using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;
using UnityEngine;

public class MainCanvasInterface : MonoBehaviour {
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

		if (OVRInput.Get(OVRInput.Button.DpadDown)) {
			Application.Quit ();
		}

		if (OVRInput.Get(OVRInput.Button.One)) {
			OptionsCanvas.enabled = true;
			MainCanvas.enabled = false;
			ChooseDemoCanvas.enabled = false;
		}

		if (OVRInput.Get(OVRInput.Button.DpadUp)) {
			OptionsCanvas.enabled = false;
			MainCanvas.enabled = false;
			ChooseDemoCanvas.enabled = true; 
		}
	}
}
